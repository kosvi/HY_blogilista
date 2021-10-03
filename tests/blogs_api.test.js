const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const blogObj = {
  title: 'Test Blog',
  author: 'Test Author',
  url: 'http://testblog.example.com'
}

const userObj = {
  username: 'test',
  password: 'test',
  name: 'Test User'
}

beforeAll(async () => {
  await User.deleteMany({})
  await api.post('/api/users').send(userObj)
  const res = await api.post('/api/login').send({ username: userObj.username, password: userObj.password })
  userObj.token = res.body.token
  userObj.id = res.body.id
})

describe('blogs api', () => {

  beforeEach(async () => {
    await Blog.deleteMany({})
    const testBlogs = helper.testBlogs.map(b => {
      return { ...b, user: userObj.id }
    })
    await Blog.insertMany(testBlogs)
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

    test('blogs have user in them', async () => {
      const response = await api.get('/api/blogs')
      response.body.map(blog => {
        expect(blog).toHaveProperty('user')
        expect(blog.user).toHaveProperty('id')
        expect(blog.user).toHaveProperty('name')
        expect(blog.user).toHaveProperty('username')
        expect(blog.user).not.toHaveProperty('_id')
        expect(blog.user).not.toHaveProperty('blogs')
        expect(blog.user).not.toHaveProperty('password')
      })
    })

    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body).toHaveLength(helper.testBlogs.length)
    })
  })
  describe('POST new blogs', () => {
    test('post blog is working', async () => {
      const res = await api.post('/api/blogs').send(blogObj).set('Authorization', `bearer ${userObj.token}`).expect(201).expect('Content-Type', /application\/json/)
      expect(res.body).toHaveProperty('user')
      expect(res.body.user).toBe(userObj.id)
      const response = await api.get('/api/blogs')
      expect(response.body).toHaveLength(helper.testBlogs.length + 1)
      expect(response.body.map(blog => blog.author)).toContain(blogObj.author)
      expect(response.body.map(blog => blog.title)).toContain(blogObj.title)
    })

    test('make sure likes default to 0', async () => {
      // make sure our test object doesn't have 'likes' before posting to api
      expect(blogObj).not.toHaveProperty('likes')
      const res = await api.post('/api/blogs').send(blogObj).set('Authorization', `bearer ${userObj.token}`)
      expect(res.body).toHaveProperty('likes')
      expect(res.body.likes).toBe(0)
      expect(res.body.likes).not.toBe(1)
    })

    test('make sure api sends 400 if mandatory properties are missing', async () => {
      // missing url
      await api.post('/api/blogs').send({ title: '123', author: 'Name' }).set('Authorization', `bearer ${userObj.token}`).expect(400).expect('Content-Type', /application\/json/)
      // missing title
      await api.post('/api/blogs').send({ author: 'Name', url: 'http://foo.example.com' }).set('Authorization', `bearer ${userObj.token}`).expect(400).expect('Content-Type', /application\/json/)
      // missing everything
      await api.post('/api/blogs').send({}).set('Authorization', `bearer ${userObj.token}`).expect(400).expect('Content-Type', /application\/json/)
    })

    test('make sure api sends 401 if token is missing on incorrect', async () => {
      const res = await api.post('/api/blogs').send(blogObj).expect(401)
      expect(res.body).toHaveProperty('error')
      await api.post('/api/blogs').send(blogObj).set('Authorization', `bearer ${userObj.token}2`).expect(401)
    })

    test('make sure blog is not stored if token is incorrect', async () => {
      await api.post('/api/blogs').send(blogObj).expect(401)
      await api.post('/api/blogs').send(blogObj).set('Authorization', `bearer ${userObj.token}2`).expect(401)
      const res = await api.get('/api/blogs')
      expect(res.body.map(blog => blog.title)).not.toContain(blogObj.title)
      expect(res.body.map(blog => blog.author)).not.toContain(blogObj.author)
    })
  })

  describe('DELETE blogs', () => {
    test('allow deleting blog by id', async () => {
      const blogsInDb = await helper.blogsInDB()
      const res = await api.delete(`/api/blogs/${blogsInDb[0].id}`).set('Authorization', `bearer ${userObj.token}`)
      expect(res.status).toBe(204)
      const allBlogs = await api.get('/api/blogs')
      expect(allBlogs.body).toHaveLength(helper.testBlogs.length - 1)
      expect(allBlogs.body.map(b => b.id)).not.toContain(blogsInDb[0].id)
    })
    test('delete with id not found in db returns 404', async () => {
      const nonExistingId = await helper.nonExistingId()
      const res = await api.delete(`/api/blogs/${nonExistingId}`).set('Authorization', `bearer ${userObj.token}`)
      expect(res.status).toBe(404)
      const allBlogs = await api.get('/api/blogs')
      expect(allBlogs.body).toHaveLength(helper.testBlogs.length)
    })
    test('delete without proper token gives 401', async () => {
      const blogsInDb = await helper.blogsInDB()
      const res = await api.delete(`/api/blogs/${blogsInDb[0].id}`).expect(401)
      expect(res.body).toHaveProperty('error')
    })
    test('do not allow deleting of blogs not posted by user', async () => {
      // let's first add another user
      await api.post('/api/users').send({ username: 'someone', password: 'someone', name: 'someone' })
      // login with that user
      const loginResponse = await api.post('/api/login').send({ username: 'someone', password: 'someone' })
      // add new blog with newly created user
      const blogPostResponse = await api.post('/api/blogs').send(blogObj).set('Authorization', `bearer ${loginResponse.body.token}`)
      const blogId = blogPostResponse.body.id
      // let's get the number of blogs in the database
      const beforeDeleteGet = await api.get('/api/blogs')
      const blogsBeforeDelete = beforeDeleteGet.body.length
      // now try to delete 'blogId' as someone else
      await api.delete(`/api/blogs/${blogId}`).set('Authorization', `bearer ${userObj.token}`).expect(401)
      // make sure blogs haven't been deleted from database
      const afterDeleteGet = await api.get('/api/blogs')
      expect(afterDeleteGet.body.length).toBe(blogsBeforeDelete)
    })
  })

  describe('PUT blogs', () => {
    test('allow adding a like to a blog by id', async () => {
      const blogsInDb = await helper.blogsInDB()
      const blogs = blogsInDb.map(b => {
        delete b.user
        return b
      })
      const id = blogs[0].id
      const likes = blogs[0].likes
      const updatedBlog = { ...blogs[0], likes: likes + 1 }
      const res = await api.put(`/api/blogs/${id}`).send(updatedBlog)
      expect(res.status).toBe(200)
      delete res.body.user
      expect(res.body).toEqual(updatedBlog)
    })
    test('allow editing title, author and url of blog', async () => {
      const blogsInDb = await helper.blogsInDB()
      const blogs = blogsInDb.map(b => {
        delete b.user
        return b
      })
      const updatedBlog = { ...blogs[0], title: 'foo', author: 'bar', url: 'http://www.blog.example.com' }
      const res = await api.put(`/api/blogs/${updatedBlog.id}`).send(updatedBlog)
      expect(res.status).toBe(200)
      delete res.body.user
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

