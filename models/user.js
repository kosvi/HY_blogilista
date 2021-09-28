const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: { type: String, required: true, minlength: 3, unique: true, dropDups: true },
  password: { type: String },
  name: { type: String }
})

userSchema.set('toJSON', {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id.toString()
    delete returnedObj._id
    delete returnedObj.__v
    delete returnedObj.password
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User