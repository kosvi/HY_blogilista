const Blog = require('../models/blog')
const User = require('../models/user')

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

const testUsers = [
  {
    username: 'user1',
    password: 'password1',
    name: 'User Name'
  },
  {
    username: 'user2',
    password: 'password2',
    name: 'Test User'
  }
]

const incorrectUsers = [
  {
    password: 'longenough',
    name: 'Some Name'
  },
  {
    username: 'longenough',
    name: 'Some Name'
  },
  {
    username: 'fo',
    password: 'longenough',
    name: 'Some Name'
  },
  {
    username: 'longenough',
    password: 'fo',
    name: 'Some Name'
  },
  {
    username: 'fo',
    password: 'ba',
    name: 'Some Name'
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

const usersInDB = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  testBlogs, nonExistingId, blogsInDB,
  testUsers, incorrectUsers, usersInDB
}
