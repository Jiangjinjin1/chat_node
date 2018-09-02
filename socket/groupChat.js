import _ from 'lodash'

export const groupChat = (socket, io, params) => {
  const {
    users,
    usockets
  } = params

  // 这里是群聊
  socket.on('SEND_MESSAGE',function(data) {
    // console.log('socket-session:', socket.request.session)
    const sendMsg = {}
    const session = socket.request.session
    if(!_.isEmpty(session.userBasicInfo) && session.userBasicInfo.nickname === data.nickname) {
      Object.assign(sendMsg,{...data, type: '0'})
    } else {
      Object.assign(sendMsg,{...data, type: '1'})
    }
    io.emit('SOCKET_USER_MESSAGE', sendMsg)
  })
}

export default {}