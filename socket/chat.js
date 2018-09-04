import socketIo from 'socket.io'
import {groupChat} from './groupChat'
import {privateChat} from './privateChat'

export const IO = (server, sessionMiddleware) => {
  const io = socketIo(server)

  // socket.io和express共享session中间件
  io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
  })

  const users = {} // 用户名存储
  const usockets = {} // 用户的socket对象存储
  let userCount = 0 // 加入聊天室的用户数量

  const chat1 = io.of('/chat') // 命名空间，为了以后分出不同线路做拓展

  /**
   * socket.emit() ：向建立该连接的客户端广播
     socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
    io.sockets.emit() ：向所有客户端广播，等同于上面两个的和
  */

  chat1.on('connection', function(socket) {
    // 共享session查询
    // console.log('socket-session:', socket.request.session)
    let curUsername = ''

    socket.on('disconnect', function() {
      if(curUsername) {
        users[curUsername] = undefined
        usockets[curUsername] = undefined
        userCount--
      }

      chat1.emit('SHOW_USER_LEAVE', {
        userCount,
        users,
        message: `用户<b>${curUsername}</b>离开聊天室`
      })
    })

    // 这里是群聊
    groupChat(socket, chat1, {
      users,
      usockets,
      userCount
    })

    // 私聊
    privateChat(socket, chat1, {
      users,
      usockets
    }, io)
    
    // 用户进入
    socket.on('USER_JOIN', function(data) {
      const {
        username,
      } = data

      curUsername = username
      if(!users[username]) {
        userCount++
      }
      const session = socket.request.session
      const userBasicInfo = session.userBasicInfo

      users[username] = userBasicInfo
      console.log('users[username]=-------=:', users)
      usockets[username] = socket

      chat1.emit('SHOW_USER_JOIN', {
        userCount,
        users,
        message: `欢迎<b>${username}</b>进入聊天室`
      })
      
    })
  })
}