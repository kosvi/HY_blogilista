const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

const userObj = {
  username: 'foobar',
  password: 'foobar',
  name: 'Foo Bar'
}
const incorrectUsers = helper.incorrectUsers

describe('users api', () => {

  beforeEach(async () => {
    await User.deleteMany({})
    await User.insertMany(helper.testUsers)
  })

  describe('GET users', () => {
    test('List all users in json format', async () => {
      const res = await api.get('/api/users').expect(200).expect('Content-Type', /application\/json/)
      expect(res.body).toHaveLength(helper.testUsers.length)
    })
    test('Users returned contain id, username and name, but no _id and password', async () => {
      const res = await api.get('/api/users')
      const user = res.body[0]
      expect(user.id).toBeDefined()
      expect(user.username).toBeDefined()
      expect(user.name).toBeDefined()
      expect(user._id).not.toBeDefined()
      expect(user.password).not.toBeDefined()
    })
  })

  describe('POST new user', () => {
    test('Add a new user', async () => {
      await api.post('/api/users').send(userObj).expect(201).expect('Content-Type', /application\/json/)
      const response = await api.get('/api/users')
      expect(response.body.map(u => u.username)).toContain(userObj.username)
    })
    test('User with incorrect username/password returns 400', async () => {
      let res = {}
      res = await api.post('/api/users').send(incorrectUsers[0]).expect(400)
      expect(res.body.error).toBeDefined()
      res = await api.post('/api/users').send(incorrectUsers[1]).expect(400)
      expect(res.body.error).toBeDefined()
      res = await api.post('/api/users').send(incorrectUsers[2]).expect(400)
      expect(res.body.error).toBeDefined()
      res = await api.post('/api/users').send(incorrectUsers[3]).expect(400)
      expect(res.body.error).toBeDefined()
      res = await api.post('/api/users').send(incorrectUsers[4]).expect(400)
      expect(res.body.error).toBeDefined()
    })
    test('Do not allow duplicate usernames', async () => {
      const res = await api.post('/api/users').send(helper.testUsers[0]).expect(400)
      expect(res.body.error).toBeDefined()
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})