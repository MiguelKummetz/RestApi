require('dotenv').config()
const connectDB = require('./mongo')
connectDB()
const express = require('express')
const app = express()
const logger = require('./loggerMiddleware')
const Note = require('./models/Note')
const notFound = require('./notFound')
const handleErrors = require('./handleErrors')
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

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
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
app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params

  Note.findByIdAndDelete(id)
    .then(() => { response.status(204).end() })
    .catch(error => { next(error) })
})

// Delete version with async/await:
app.delete('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params

  Note.findByIdAndDelete(id)
    .then(() => { response.status(204).end() })
    .catch(error => { next(error) })
})

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => { response.json(result) })
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

//   newNote.save().then(savedNote => {
//     response.json(savedNote)
//   }).catch(err => next(err))
// })

// POST version with async/await:
app.post('/api/notes', async (request, response, next) => {
  const note = request.body
  if (!note || !note.content) {
    return response.status(400).json({
      error: 'required "content" field is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    important: typeof note.important !== 'undefined' ? note.important : false,
    date: new Date()// .toISOString()
  })

  try {
    const savedNote = await newNote.save()
    response.json(savedNote)
  } catch (e) {
    next(e)
  }
})
// middleware for errror handeling of non existing URLs
app.use(notFound)

// middleware for errror handeling of non existing IDs
app.use(handleErrors)

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// process.on('uncaughtException', () => {
//   mongoose.connection.close()
// })

module.exports = { app, server }
