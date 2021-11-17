const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const middleware = require('../utils/middleware')

// comments

blogsRouter.get('/:id/comments', async (request, response) => {
  const id = request.params.id
  const res = await Comment.find({ blog: id })
  response.json(res)
})

blogsRouter.post('/:id/comments', async (request, response, next) => {
  const commentObj = {
    content: request.body.content,
    blog: request.params.id
  }
  try {
    const comment = new Comment(commentObj)
    const res = await comment.save()
    response.status(201).json(res)
  } catch (err) {
    next(err)
  }
})

// blogs

blogsRouter.get('/', async (request, response) => {
  const res = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(res)
})

blogsRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const res = await Blog.findById(id).populate('user', { username: 1, name: 1, id: 1 })
  response.json(res)
})

blogsRouter.post('/', middleware.authenticate, async (request, response, next) => {
  if (!Object.prototype.hasOwnProperty.call(request, 'userId')) {
    // middleware has not added userId -> error
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

blogsRouter.delete('/:id', middleware.authenticate, async (request, response, next) => {
  const id = request.params.id
  // first check that user is also the poster
  if (!Object.prototype.hasOwnProperty.call(request, 'userId')) {
    // user is not logged in, middleware should have handled this!
    next()
    return
  }
  const blog = await Blog.findById(id)
  if (blog === null) {
    // 404
    response.status(404).end()
    return
  }
  if (blog.user.toString() !== request.userId) {
    response.status(401).json({ error: 'unauthorized' })
    next()
    return
  }
  try {
    await Blog.findByIdAndDelete(id)
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