/* eslint-disable no-undef */
const mongoose = require('mongoose')
const { server } = require('../index')
const Note = require('../models/Note')
const { api, initialNotes, getAllContentFromNotes } = require('./helpers')

beforeEach(async () => {
  await Note.deleteMany({})

  // setting the notes manually:
  // const note1 = new Note(initialNotes[0])
  // await note1.save()

  // const note2 = new Note(initialNotes[1])
  // await note2.save()

  // const note3 = new Note(initialNotes[2])
  // await note3.save()

  // setting the notes in parallel: can fail sometimes
  // const notesObjects = initialNotes.map(note => new Note(note))
  // const promises = notesObjects.map(note => note.save())
  // await Promise.all(promises)

  // setting the notes sequentially:
  for (const note of initialNotes) {
    const notesObject = new Note(note)
    await notesObject.save()
  }
})

describe('testing GET', () => {
  test('notes are returned as JSON', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are 3 notes', async () => {
    const { response } = await getAllContentFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })

  test('cheking the content of the first note', async () => {
    const { response } = await getAllContentFromNotes()
    expect(response.body[0].content).toBe('this is a test note')
  })

  test('cheking if there is a specific content in one of the notes', async () => {
    const { contents } = await getAllContentFromNotes()

    expect(contents).toContain('this is a test note too')
  })

  test('cheking if there is a not important note', async () => {
    const { importants } = await getAllContentFromNotes()

    expect(importants).toContain(false)
  })
})
describe('testing POST', () => {
  test('a valid note can be added', async () => {
    const newNote = {
      content: 'test note created in a POST test',
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { contents, response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length + 1)
    expect(contents).toContain(newNote.content)
  })

  test('a note without content is not added', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const { response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length)
  })
})
describe('testing DELETE', () => {
  test('a note can be deleted', async () => {
    const { ids } = await getAllContentFromNotes()
    const noteToDelete = ids[0]

    await api
      .delete(`/api/notes/${noteToDelete}`)
      .expect(204)

    const { response, contents } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length - 1)
    expect(contents).not.toContain(noteToDelete.content)
  })

  test('a non existing note can not be deleted', async () => {
    await api
      .delete('/api/notes/1234')
      .expect(400)

    const { response } = await getAllContentFromNotes()

    expect(response.body).toHaveLength(initialNotes.length)
  })
})

describe('testing PUT', () => {
  test('a note can be updated with a diferent "content" value', async () => {
    const testMessage = 'using PUT to change just the content'
    const newNoteInfo = {
      content: testMessage
    }
    const { ids } = await getAllContentFromNotes()
    const noteLocation = 0
    const noteToUpdate = ids[noteLocation]

    await api
      .put(`/api/notes/${noteToUpdate}`)
      .send(newNoteInfo)
      .expect(200)

    const { response } = await getAllContentFromNotes()

    expect(response.body[noteLocation].content).toBe(testMessage)
  })

  test('a note can be updated with a diferent "important" value', async () => {
    const newNoteInfo = {
      important: false
    }
    const { ids } = await getAllContentFromNotes()
    const noteLocation = 0
    const noteToUpdate = ids[noteLocation]

    await api
      .put(`/api/notes/${noteToUpdate}`)
      .send(newNoteInfo)
      .expect(200)

    const { response } = await getAllContentFromNotes()

    expect(response.body[noteLocation].important).toBe(false)
  })

  test('a note can be updated', async () => {
    const newNoteInfo = {
      content: 'this note has been updated in a test',
      important: false
    }
    const { ids } = await getAllContentFromNotes()
    const noteLocation = 0
    const noteToUpdate = ids[noteLocation]

    await api
      .put(`/api/notes/${noteToUpdate}`)
      .send(newNoteInfo)
      .expect(200)

    const { response } = await getAllContentFromNotes()

    expect(response.body[noteLocation].content).toBe('this note has been updated in a test')
    expect(response.body[noteLocation].important).toBe(false)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
