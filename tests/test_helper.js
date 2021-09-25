const Blog = require('../models/blog')

const testBlogs = [
  {
    title: 'abc',
    author: 'Ville K',
    url: 'http://abcblog.example.com',
    likes: 10
  },
  {
    title: 'def',
    author: 'Kolle Vii',
    url: 'http://defblog.example.com',
    likes: 5
  }
]

const nonExistingId = async () => {
  const blog = new Blog(testBlogs[0])
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}

const blogsInDB = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  testBlogs, nonExistingId, blogsInDB
}
