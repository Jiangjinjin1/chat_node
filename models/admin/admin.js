import mongoose from 'mongoose'
import db from '../../mongodb/db'

const Schema = mongoose.Schema

const chatuserSchema = new Schema({
  username: {type: String, unique: true},
  password: {type: String, required: true},
  userId: {type: String, unique: true},
  avatar: {type: String, default: ''},
  nickname: {type: String, default: ''}
})

chatuserSchema.index({id: 1})

const User = db.model('ChatUser', chatuserSchema)

export default {User}
