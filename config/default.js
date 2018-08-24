'use strict'

const url = 'mongodb://localhost:27017/chat_node'

export default {
  port: 9000,
	url,
	session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
		    secure:   false,
		    maxAge:   365 * 24 * 60 * 60 * 1000,
		}
	},
	redisClient: {
		host: '127.0.0.1',
		port: 6379,
		password: '123456'
	}
}