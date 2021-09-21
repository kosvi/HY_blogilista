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

module.exports = {
  dummy,
  totalLikes
}