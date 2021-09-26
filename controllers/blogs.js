const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const res = await Blog.find({})
  response.json(res)
})

blogsRouter.post('/', async (request, response, next) => {
  const blogObj = request.body
  if (!Object.prototype.hasOwnProperty.call(blogObj, 'likes')) {
    blogObj.likes = 0
  }
  try {
    const blog = new Blog(blogObj)
    const res = await blog.save()
    response.status(201).json(res)
  } catch (err) {
    next(err)
  }
})

module.exports = blogsRouter