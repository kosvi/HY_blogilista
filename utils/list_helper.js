const lodash = require('lodash')

const dummy = (blogs) => {
  // lint doesn't like this, let's get some use for blogs!
  if (blogs.length > -1)
    return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (prev, current) => {
    if (prev.likes > current.likes)
      return prev
    else
      return current
  }
  return blogs.reduce(reducer, { likes: -1 })
}

const mostBlogs = (blogs) => {
  // the lines beneath could be combined to remove the need for authorArray, but let's keep it this way
  // did spend some time (~20-30 minutes) reading this: https://lodash.com/docs/4.17.15
  const authorArray = lodash.groupBy(blogs, 'author')
  const theAuthor = lodash.reduce(authorArray, (result, value, key) => {
    if (result.blogs > value.length)
      return result
    else
      return { author: key, blogs: value.length }
  }, { author: '', blogs: -1 })
  return theAuthor
}

// kinda already had this in the previous exercise
const mostLikes = (blogs) => {
  const theAuthor = lodash.reduce(lodash.groupBy(blogs, 'author'), (result, value, key) => {
    const likes = value.reduce((sum, next) => { return sum + next.likes }, 0)
    if (result.likes > likes)
      return result
    else
      return { author: key, likes: likes }
  }, { author: '', likes: -1 })
  return theAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}