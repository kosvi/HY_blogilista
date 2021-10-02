const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const res = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, id: 1 })
  response.json(res)
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body
  const saltRounds = 10
  const passwordMinLength = 3

  if (!Object.prototype.hasOwnProperty.call(body, 'password')) {
    response.status(400).json({ error: 'password is required' })
    return
  }
  // check that password is valid
  if (body.password.length < passwordMinLength) {
    // wasn't provided or was too short
    response.status(400).json({ error: 'password is too short' })
    return
  }
  try {
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    const user = new User({
      username: body.username,
      name: body.name,
      password: passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter