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