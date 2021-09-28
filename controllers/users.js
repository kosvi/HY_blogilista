const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const res = await User.find({})
  response.json(res)
})

usersRouter.post('/', async (request, response, next) => {
  const body = request.body
  const saltRounds = 10
  const passwordMinLength = 3

  // check that password is valid
  if (!body.password || body.password.length < passwordMinLength) {
    // wasn't provided or was too short
    response.status(400).json({ error: 'password is too short' })
  }

  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  try {
    const user = new User({
      username: body.username,
      name: body.name,
      password: passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (err) {
    next(err)
  }
})

module.exports = usersRouter