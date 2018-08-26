import express from 'express'
import socketIo from 'socket.io'
import http from 'http'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import redis from 'redis'
import Redis from 'connect-redis'
import winston from 'winston';
import expressWinston from 'express-winston';
import path from 'path';
import history from 'connect-history-api-fallback';
import './mongodb/db'
import router from './routes/index.js'
import config from './config/default'
import shortid from 'js-shortid'

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

io.on('connection', function(socket) {
  console.log('a user comming')
})


// 中间件及路由配置

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-control-Allow-Credentials", true); //可以带cookies
  res.header("X-Powered-By", "3.2.1");
  if(req.method === 'OPTIONS') {
    res.send(200);
  } else{
    next();
  }
})

//解析cookie
app.use(cookieParser())

const RedisStore = Redis(session)

//创建redis客户端
const redisClient = redis.createClient({
  host: config.redisClient.host,
  port: config.redisClient.port,
  // password: config.redisClient.password
})


//缓存到session到redis数据库
app.use(session({
  name: config.session.name,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie: config.session.cookie,
  store: new RedisStore({client: redisClient}),
}))

// 测试
app.use(function (req, res, next) {  
  console.log('req.session-----:',req.session)
  if (!req.session) {
    return next(new Error('error'))
  }
  next()
})

app.use(expressWinston.logger({
  transports: [
      new (winston.transports.Console)({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: 'logs/success.log'
      })
  ]
}));

router(app);

app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        }),
        new winston.transports.File({
          filename: 'logs/error.log'
        })
    ]
}));

app.use(history())

app.use(express.static(path.join(__dirname, 'public')))
app.use((err, req, res, next) => {
	res.status(404).send('未找到当前路由');
});



server.listen(config.port, function() {
  console.log('已经监听到端口9000')
})