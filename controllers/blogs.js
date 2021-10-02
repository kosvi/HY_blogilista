const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const res = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(res)
})

blogsRouter.post('/', middleware.authenticate, async (request, response, next) => {
  if (!Object.prototype.hasOwnProperty.call(request, 'userId')) {
    // middleware has not added userId -> error
    response.status(500).json({ error: 'no userId in the request' })
    return
  }
  const user = await User.findById(request.userId)
  let likes = 0
  if (Object.prototype.hasOwnProperty.call(request.body, 'likes')) {
    likes = request.body.likes
  }
  const blogObj = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: likes,
    user: request.userId
  }
  try {
    const blog = new Blog(blogObj)
    const res = await blog.save()
    user.blogs = user.blogs.concat(res._id)
    await user.save()
    response.status(201).json(res)
  } catch (err) {
    next(err)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const res = await Blog.findByIdAndDelete(id)
    if (res === null) {
      // 404
      response.status(404).end()
    }
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id
  try {
    const res = await Blog.findOneAndUpdate({ _id: id },
      {
        title: request.body.title,
        author: request.body.author,
        url: request.body.url,
        likes: request.body.likes
      }, { runValidators: true })
    if (res) {
      const updatedBlog = await Blog.findById({ _id: id })
      response.json(updatedBlog)
    }
    else
      response.status(404).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter