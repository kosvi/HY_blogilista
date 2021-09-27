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

describe('blogs api', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.testBlogs)
  })

  describe('GET tests and JSON format', () => {
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
  })
  describe('POST new blogs', () => {
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

  describe('DELETE blogs', () => {
    test('allow deleting blog by id', async () => {
      const blogsInDb = await helper.blogsInDB()
      const res = await api.delete(`/api/blogs/${blogsInDb[0].id}`)
      expect(res.status).toBe(204)
      const allBlogs = await api.get('/api/blogs')
      expect(allBlogs.body).toHaveLength(helper.testBlogs.length - 1)
      expect(allBlogs.body.map(b => b.id)).not.toContain(blogsInDb[0].id)
    })
    test('delete with id not found in db returns 404', async () => {
      const nonExistingId = await helper.nonExistingId()
      const res = await api.delete(`/api/blogs/${nonExistingId}`)
      expect(res.status).toBe(404)
      const allBlogs = await api.get('/api/blogs')
      expect(allBlogs.body).toHaveLength(helper.testBlogs.length)
    })
  })

  describe('PUT blogs', () => {
    test('allow adding a like to a blog by id', async () => {
      const blogsInDb = await helper.blogsInDB()
      const id = blogsInDb[0].id
      const likes = blogsInDb[0].likes
      const updatedBlog = { ...blogsInDb[0], likes: likes + 1 }
      const res = await api.put(`/api/blogs/${id}`).send(updatedBlog)
      expect(res.status).toBe(200)
      expect(res.body).toEqual(updatedBlog)
    })
    test('allow editing title, author and url of blog', async () => {
      const blogsInDb = await helper.blogsInDB()
      const updatedBlog = { ...blogsInDb[0], title: 'foo', author: 'bar', url: 'http://www.blog.example.com' }
      const res = await api.put(`/api/blogs/${updatedBlog.id}`).send(updatedBlog)
      expect(res.status).toBe(200)
      expect(res.body).not.toEqual(blogsInDb[0])
      expect(res.body).toEqual(updatedBlog)
    })
    test('editing with non-existing id gives 404', async () => {
      const nonExistingId = await helper.nonExistingId()
      const blog = { id: nonExistingId, title: 'foo', author: 'bar', url: 'http://foo.example.com', likes: 100 }
      const res = await api.put(`/api/blogs/${nonExistingId}`).send(blog)
      expect(res.status).toBe(404)
      expect(res.body).not.toEqual(blog)
    })
  })
})


afterAll(() => {
  mongoose.connection.close()
})

