const logger = require('./logger')
const jwt = require('jsonwebtoken')

const errorHandler = (error, request, response, next) => {
  logger.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformed id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  }
  next(error)
}

const authenticate = async (request, response, next) => {
  const auth = request.get('authorization')
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    response.status(401).json({ error: 'invalid token' })
    next()
    return
  }
  try {
    const token = jwt.verify(auth.substring(7), process.env.SECRET)
    if (!token || !token.id) {
      response.status(401).json({ error: 'invalid token' })
      return
    }
    const user = token.username
    const id = token.id
    request.user = user
    request.userId = id
  } catch (error) {
    logger.log(error.message)
    response.status(401).json({ error: 'invalid token' })
  }
  next()
}

module.exports = {
  errorHandler,
  authenticate
}