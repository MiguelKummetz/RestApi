/* eslint-disable no-undef */
const mongoose = require('mongoose')
const User = require('../models/User')
const { server } = require('../index')
const { api } = require('./helpers')
const bcrypt = require('bcrypt')

describe('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const password = 'testpassword'
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({ username: 'AmiTest', passwordHash })

    await user.save()
  })

  test('works as expected creating a new user', async () => {
    const usersDB = await User.find({})
    const usersAtStart = usersDB.map(user => user.toJSON())

    const newUser = {
      username: 'Testusername',
      name: 'Testname',
      password: 'testpassword'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersDBAfter = await User.find({})
    const usersAtEnd = usersDBAfter.map(user => user.toJSON())

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })
  afterAll(() => {
    mongoose.connection.close()
    server.close()
  })
})
