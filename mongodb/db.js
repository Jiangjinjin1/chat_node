import mongoose from 'mongoose'
import config from '../config/default'

const conncetDB = () => {
  mongoose.connect(config.url, {
    autoReconnect: true,
    useNewUrlParser: true
  })
}

conncetDB()


mongoose.Promise = global.Promise

const db = mongoose.connection;

db.once('open', () => {
  console.log('链接数据库成功')
  console.log(config.url)
})

db.on('error', function(error) {
  console.error(`Error in Mongodb connection:'${error}`)
  mongoose.disconnect();
})

db.on('close', function() {
  console.log('数据库断开， 重新链接数据库')
  conncetDB()
})

export default db