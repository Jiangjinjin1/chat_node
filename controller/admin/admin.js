import formidable from 'formidable'
import _ from 'lodash'
import shortid from 'js-shortid'
import AdminModel from '../../models/admin/admin'

const {User} = AdminModel

class Admin {
  constructor() {
    // 构造函数
  }

  async regist(req, res, next) {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fileds, files)=>{
      if(err) {
        res.send({
          code: 1000,
          type: 'FORM_DATA_ERROR',
          msg: '表单信息错误'
        })
      }

      const {username, password} = fileds
      console.log('fileds:', fileds)

      try {
        if(_.isEmpty(username)) {
          throw new Error('用户名参数错误')
        } else if(_.isEmpty(password)) {
          throw new Error('密码参数错误')
        }
      }catch(e) {
        res.send({
          code: 1000,
          type: 'GET_ERRO_PARAM',
          msg: e.message
        })
      }

      //将有效的用户名和密码存入数据库
      //注册时先比对数据库是否存在相同的用户名
      console.log('User-----:', User)

      try{
        const userInfo = await User.find({username})
        const userId = shortid.gen()
        if(!_.isEmpty(userInfo)) {
          throw new Error('该账户已被注册，请更换账号重新注册')
        } else {
          const newUserInfo = {
            username,
            password,
            userId
          }

          const newUser = await User.create(newUserInfo).catch(function(err) {
            throw new Error(`创建用户发生错误${err}`)
          })

          res.send({
            code: 0,
            data: newUser,
            msg: '新增用户成功'
          })
        }
      }catch(e) {
        res.send({
          code: 1000,
          type: 'CRESTE_USER_ERRO',
          msg: e.message
        })
      }

    })
  }

  async login(req, res, next) {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fileds, files)=>{
      if(err) {
        res.send({
          code: 1000,
          type: 'FORM_DATA_ERROR',
          msg: '表单信息错误'
        })
      }

      const {username, password} = fileds
      console.log('fileds:', fileds)

      try {
        if(_.isEmpty(username)) {
          throw new Error('用户名参数错误')
        } else if(_.isEmpty(password)) {
          throw new Error('密码参数错误')
        }
      }catch(e) {
        res.send({
          code: 1000,
          type: 'GET_ERRO_PARAM',
          msg: e.message
        })
      }
      
      try{
        const currentUsername = await User.find({username})
        if(_.isEmpty(currentUsername)) {
          throw new Error('用户名不存在')
        } else{
          const curUser = await User.findOne({username, password})
          if(!_.isEmpty(curUser)) {
            res.send({
              code: 0,
              data: curUser,
              msg: '登录成功'
            })
          }else {
            throw new Error('密码输入不正确')
          }
        }
      }catch (e) {
        res.send({
          code: 1000,
          type: 'USER_LOGIN_ERROR',
          msg: e.message
        })
      }

    })
  }

  async modifyPassWord(req, res, next) {
    const form = formidable.IncomingForm()

    form.parse(req, async (err, fileds, files) => {
      try{
        const {
          username,
          password
        } = fileds

        try {
          if(_.isEmpty(username)) {
            throw new Error('用户名参数错误')
          } else if(_.isEmpty(password)) {
            throw new Error('密码参数错误')
          }
        }catch(e) {
          res.send({
            code: 1000,
            type: 'GET_ERRO_PARAM',
            msg: e.message
          })
        }

        const modifyUser = await User.find({username})
        if(_.isEmpty(modifyUser)) {
          throw new Error('该用户名不存在')
        } else {
          const newUserPass = await User.findOneAndUpdate({username},{password}).catch(function(e){
            throw new Error(e.message)
          })

          newUserPass.password = password

          res.send({
            code: 0,
            data: newUserPass,
            msg: '修改密码成功'
          })

        }

      }catch(e) {
        res.send({
          code: 1000,
          type: 'MODIFY_PASS_ERROR',
          msg: e.message
        })
      }
    })
  }
}

export default new Admin