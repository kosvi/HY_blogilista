const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const userObj = {
  username: 'foobar',
  password: 'foobar',
  name: 'Foo Bar'
}

describe('users api', () => {

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('POST new user', () => {
    test('Add a new user', async () => {
      await api.post('/api/users').send(userObj).expect(201).expect('Content-Type', /application\/json/)
      const response = await api.get('/api/users')
      expect(response.body.map(u => u.username)).toContain(userObj.username)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})