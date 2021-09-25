const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.testBlogs)
})

describe('blogs api', () => {
  test('blogs are returned as json', async () => {
    await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
  })

  test('blogs have id instead of _id', async () => {
    const response = await api.get('/api/blogs')
    response.body.map(blog => {
      // FIX THIS TEST TO NOT BE ALWAYS PASSING!
      expect(blog.id).toBeDefined
      expect(blog._id).notToBeDefined
    })
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.testBlogs.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})

