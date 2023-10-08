const supertest = require('supertest')
const { app } = require('../../index')
const api = supertest(app)

const initialNotes = [
  {
    content: 'this is a test note',
    date: new Date(),
    important: true
  }, {
    content: 'this is a test note too',
    date: new Date(),
    important: false
  }, {
    content: 'this is also a test note',
    date: new Date(),
    important: true
  }
]

const getAllContentFromNotes = async () => {
  const response = await api.get('/api/notes')
  return {
    contents: response.body.map(note => note.content),
    importants: response.body.map(note => note.important),
    ids: response.body.map(note => note.id),
    response
  }
}

module.exports = { initialNotes, api, getAllContentFromNotes }
