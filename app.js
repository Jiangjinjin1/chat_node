import express from 'express'
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
import { IO } from './socket/chat'
import router from './routes/index.js'
import config from './config/default'

const app = express()
const server = http.createServer(app)

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

const StoreInstance = new RedisStore({client: redisClient})

const sessionMiddleware = session({
  name: config.session.name, //  设置 cookie 中，保存 session 的字段名称，默认为 connect.sid
  secret: config.session.secret, // 通过设置的 secret 字符串，来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: false, // 即使 session 没有被修改，也保存 session 值，默认为 true。
  saveUninitialized: false, // 刚被创建没有被修改,如果是要实现登陆的session那么最好设置为false
  cookie: config.session.cookie,
  store: StoreInstance,
})


//缓存到session到redis数据库
app.use(sessionMiddleware)

// 测试
app.use(function (req, res, next) {  
  console.log('req.session-----:',req.session)
  if (!req.session) {
    return next(new Error('error'))
  }

  // 通过store实例的get方法，用sessionID获取对应的session数据
  // StoreInstance.get(req.sessionID, function(err,session) {
  //   if(err) {
  //     return next(new Error(err))
  //   }
  //   console.log('session:-----haha,',session)
  // })

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

// 建立socket.io
IO(server, sessionMiddleware)

server.listen(config.port, function() {
  console.log('已经监听到端口9000')
})