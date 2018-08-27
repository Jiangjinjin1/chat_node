import mongoose from 'mongoose'
import db from '../../mongodb/db'

const Schema = mongoose.Schema

const chatuserSchema = new Schema({
  username: {type: String, unique: true},
  password: {type: String, required: true},
  // userId: {type: String, unique: true}, // 会自带创建_id，我用库生成userId，创建账户第二个就会报错，E11000 duplicate key error collection: chat_node.chatUsers index: user_id_1 dup key: { : null }
  avatar: {type: String, default: ''},
  nickname: {type: String, default: ''}
})

chatuserSchema.index({id: 1})

const User = db.model('ChatUser', chatuserSchema)

export default {User}
