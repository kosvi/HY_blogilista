// https://nodejs.org/api/readline.html
// https://stackoverflow.com/questions/36540996/how-to-take-two-consecutive-input-with-the-readline-module-of-node-js
const readline = require('readline')
const mongoose = require('mongoose')
const config = require('../utils/config')
const Blog = require('../models/blog')

const openConnection = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI)
    console.log('connected to MongoDB\n')
  } catch (err) {
    console.log('error connecting to MongoDB', err.message)
  }
}

const read = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const newBlog = {
  title: '',
  author: '',
  url: '',
  likes: 0
}

const q1 = () => {
  return new Promise((resolve, reject) => {
    try {
      read.question('Title of the blog: ', (title) => {
        newBlog.title = title
        resolve()
      })
    } catch (err) {
      reject()
    }
  })
}

const q2 = () => {
  return new Promise((resolve, reject) => {
    try {
      read.question('Author of the blog: ', (author) => {
        newBlog.author = author
        resolve()
      })
    } catch (err) {
      reject()
    }
  })
}

const q3 = () => {
  return new Promise((resolve, reject) => {
    try {
      read.question('url: ', (url) => {
        newBlog.url = url
        resolve()
      })
    } catch (err) {
      reject()
    }
  })
}

const printBlog = () => {
  console.log('')
  console.log('Following blog will be added: ')
  console.log(`title: ${newBlog.title}`)
  console.log(`author: ${newBlog.author}`)
  console.log(`url: ${newBlog.url}`)
  return new Promise((resolve, reject) => {
    try {
      read.question('ok? (y/n)', (ok) => {
        console.log('')
        if (ok === 'y') {
          // save the blog
          const blog = new Blog(newBlog)
          blog.save().then(console.log('saved')).catch(err => { console.log('error when saving the blog', err.message) })
        } else {
          console.log('not saved')
        }
        resolve()
      })
    } catch (err) {
      reject()
    }
  })
}

const addBlog = async () => {
  await openConnection()
  console.log('\tAdd new blog! \n')
  await q1()
  await q2()
  await q3()
  await printBlog()
  read.close()
  mongoose.connection.close()
}

addBlog()
