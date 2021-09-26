const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const blogObj = {
  title: 'Test Blog',
  author: 'Test Author',
  url: 'http://testblog.example.com'
}

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
      expect(blog).toHaveProperty('id')
      expect(blog).not.toHaveProperty('_id')
    })
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.testBlogs.length)
  })

  test('post blog is working', async () => {
    await api.post('/api/blogs').send(blogObj).expect(201).expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.testBlogs.length + 1)
    expect(response.body.map(blog => blog.author)).toContain(blogObj.author)
    expect(response.body.map(blog => blog.title)).toContain(blogObj.title)
  })

  test('make sure likes default to 0', async () => {
    // make sure our test object doesn't have 'likes' before posting to api
    expect(blogObj).not.toHaveProperty('likes')
    const res = await api.post('/api/blogs').send(blogObj)
    expect(res.body).toHaveProperty('likes')
    expect(res.body.likes).toBe(0)
    expect(res.body.likes).not.toBe(1)
  })

  test('make sure api sends 400 if mandatory properties are missing', async () => {
    // missing url
    await api.post('/api/blogs').send({ title: '123', author: 'Name' }).expect(400).expect('Content-Type', /application\/json/)
    // missing title
    await api.post('/api/blogs').send({ author: 'Name', url: 'http://foo.example.com' }).expect(400).expect('Content-Type', /application\/json/)
    // missing everything
    await api.post('/api/blogs').send({}).expect(400).expect('Content-Type', /application\/json/)
  })
})

afterAll(() => {
  mongoose.connection.close()
})

