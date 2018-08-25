
class Admin {
  constructor() {
    // 构造函数
  }

  async regist(req, res, next) {
    console.log('进入注册了')
    res.send('注册!!!')
  }

  async login(req, res, next) {
    res.send('登录!!!')
  }

  async modifyPassWord(req, res, next) {
    res.send('修改密码!!!')
  }
}

export default new Admin