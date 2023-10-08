require('dotenv').config()
const connectDB = require('./mongo')
connectDB()
const express = require('express')
const app = express()
const logger = require('./loggerMiddleware')
const jwt = require('jsonwebtoken')
const Note = require('./models/Note')
const notFound = require('./notFound')
const handleErrors = require('./handleErrors')
const usersRouter = require('./controllers/users')
const User = require('./models/User')
const loginRouter = require('./controllers/login')
const mongoose = require('mongoose')
// const cors = require('cors')

// app.use(cors())
app.use(express.json())
// const http = require('http')

// const app = http.createServer((request, response) => {
//   response.writeHead(200, {'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// })

app.use(logger)

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(notes)
})

app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findById(id).then(note => {
    if (note) {
      return response.json(note)
    } else {
      response.status(404).end()
    }
  }).catch(err => { next(err) })
})

// Short version of the app.get:
// app.get('/api/notes/:id', (request, response, next) => {
//   const { id } = request.params
//   Note.findById(id)
//     .then(note => {
//       if (note) return response.json(note)
//       response.status(404).end()
//     }).catch(next)
// })

// Delete version without async/await:
// app.delete('/api/notes/:id', (request, response, next) => {
//   const { id } = request.params

//   Note.findByIdAndDelete(id)
//     .then(() => { response.status(204).end() })
//     .catch(error => { next(error) })
// })

// Delete version with async/await:
app.delete('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    await Note.findByIdAndDelete(id)
    response.status(204).end()
  } catch (e) {
    next(e)
  }
})

app.put('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  // Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
  //   .then(result => { response.json(result) })

  try {
    const updatedNote = await Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    response.json(updatedNote)
  } catch (e) {
    next(e)
  }
})

// POST version without async/await:
// app.post('/api/notes', (request, response, next) => {
//   const note = request.body
//   if (!note || !note.content) {
//     return response.status(400).json({
//       error: 'required "content" field is missing'
//     })
//   }

//   const newNote = new Note({
//     content: note.content,
//     important: typeof note.important !== 'undefined' ? note.important : false,
//     date: new Date()// .toISOString()
//   })

//   newNote.save()
//   .then(savedNote => { response.json(savedNote)})
//   .catch(err => next(err))
// })

// POST version with async/await:
app.post('/api/notes', async (request, response, next) => {
  const {
    content,
    important = false
  } = request.body

  const authorization = request.get('authorization')
  let token = ''
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    token = authorization.substring(7)
  }
  let decodedToken = {}
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (e) {
    next(e)
  }

  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const { id: userId } = decodedToken
  const user = await User.findById(userId)

  if (!content) {
    return response.status(400).json({
      error: 'required "content" field is missing'
    })
  }

  const newNote = new Note({
    content,
    date: new Date(), // .toISOString()
    important,
    user: user._id // user.toJSON().id
  })

  try {
    const savedNote = await newNote.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.json(savedNote)
  } catch (e) {
    next(e)
  }
})

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// middleware for errror handeling of non existing URLs
app.use(notFound)

// middleware for errror handeling of non existing IDs
app.use(handleErrors)

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

process.on('uncaughtException', () => {
  mongoose.connection.close()
})

module.exports = { app, server }
