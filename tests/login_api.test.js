const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

describe('Login api tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const testUserPasswordHash = await bcrypt.hash(helper.testUsers[0].password, 10)
    const testUser = new User({
      username: helper.testUsers[0].username,
      password: testUserPasswordHash,
      name: helper.testUsers[0].name
    })
    await testUser.save()
  })

  test('succesfull login', async () => {
    const body = { username: helper.testUsers[0].username, password: helper.testUsers[0].password }
    const res = await api.post('/api/login').send(body).expect(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.username).toBe(helper.testUsers[0].username)
    expect(res.body.name).toBe(helper.testUsers[0].name)
  })

  test('incorrect password for existing user returns 401', async () => {
    const body = { username: helper.testUsers[0].username, password: `${helper.testUsers[0].password}incorrect` }
    const res = await api.post('/api/login').send(body).expect(401)
    expect(res.body.error).toBeDefined()
    expect(res.body.token).not.toBeDefined()
  })

  test('empty username return 401', async () => {
    const body = { password: helper.testUsers[0].password }
    const res = await api.post('/api/login').send(body).expect(401)
    expect(res.body.error).toBeDefined()
  })

  test('empty body returns 401', async () => {
    await api.post('/api/login').send({}).expect(401)
  })
})

afterAll(() => {
  mongoose.connection.close()
})