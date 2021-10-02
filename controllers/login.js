const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (req, res) => {
  const errorMsg = 'invalid username or password'
  const body = req.body

  const user = await User.findOne({ username: body.username })
  // if user wasn't found, we can exit right away
  if (user === null) {
    return res.status(401).json({ error: errorMsg })
  }
  const passwordCorrect = await bcrypt.compare(body.password, user.password)
  // now we can check if pwd was correct
  if (!passwordCorrect) {
    return res.status(401).json({ error: errorMsg })
  }
  // ok, so login succeeded
  const userForToken = {
    username: user.username,
    id: user._id
  }
  const token = jwt.sign(userForToken, process.env.SECRET)

  res.status(200).send({ token, username: user.username, name: user.name, id: user._id })
})

module.exports = loginRouter