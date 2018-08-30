import formidable from 'formidable'
import _ from 'lodash'
import fs from 'fs'
import path from 'path'
// import shortid from 'js-shortid'
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

      try{
        const userInfo = await User.find({username})
        // const userId = shortid.gen()
        if(!_.isEmpty(userInfo)) {
          throw new Error('该账户已被注册，请更换账号重新注册')
        } else {
          const newUserInfo = {
            username,
            password,
            // userId
          }

          const newUser = await User.create(newUserInfo).catch(function(err) {
            throw new Error(`创建用户发生错误${err}`)
          })

          newUser.password = undefined

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
            curUser.password = undefined
            req.session.userBasicInfo = curUser

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

      if(err) {
        res.send({
          code: 1000,
          type: 'FORM_DATA_ERROR',
          msg: '表单信息错误'
        })
      }

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

          newUserPass.password = undefined

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

  async addNickName(req, res, next) {
    const form = formidable.IncomingForm()

    form.parse(req, async(err, fields, files) => {
      if(err) {
        res.send({
          code: 1000,
          type: 'FORM_DATA_ERROR',
          msg: '表单信息错误'
        })
      }

      try{
        const {
          nickname
        } = fields
        const userBasicInfo = req.session.userBasicInfo
        if(!_.isEmpty(userBasicInfo)) {
          const {
            username
          } = userBasicInfo

          const newUserInfo = await User.findOneAndUpdate({username},{nickname}).catch((e) => {
            throw new Error(e.massage)
          })

          newUserInfo.password = undefined
          newUserInfo.nickname = nickname

          res.send({
            code: 0,
            data: newUserInfo,
            msg: '添加昵称成功'
          })
        } else {
          res.send({
            code: 2000,
            type: 'LOGIN_INVALID_ERROR',
            msg: '用户登录已失效'
          })
        }

      }catch(e){
        res.send({
          code: 1000,
          type: 'USER_ADD_NICKNAME_ERROR',
          msg: e.message
        })
      }

    })
  }

  async checkLogin(req, res, next) {

    try{
      if(!_.isEmpty(req.session.userBasicInfo)) {
        res.send({
          code: 0,
          data: req.session.userBasicInfo,
          msg: '该用户登录过'
        })
      } else {
        res.send({
          code: 2000,
          type: 'LOGIN_INVALID_ERROR',
          msg: '用户登录已失效'
        })
      }
    }catch(e) {
      res.send({
        code: 1000,
        type: 'CHECK_LOGIN_ERROR',
        msg: e.message
      })
    }
  }

  async logout(req, res, next) {
    try{
      const session = req.session
      if(!_.isEmpty(session.userBasicInfo)) {
        const {
          _id,
        } = session.userBasicInfo

        await User.findOneAndUpdate({_id}).catch((e) => {
          throw new Error(e.massage)
        })

        delete session.userBasicInfo

        res.send({
          code: 0,
          data: {},
          msg: '注销账户成功'
        })
      } else {
        res.send({
          code: 2000,
          type: 'LOGIN_INVALID_ERROR',
          msg: '用户登录已失效'
        })
      }
    }catch(e) {
      res.send({
        code: 1000,
        type: 'LOGOUT_ERROR',
        msg: '注销接口失败'
      })
    }
  }

  async uploadAvatar(req, res, next) {
    try{
      const form = formidable.IncomingForm()
      form.parse(req, async (err, fileds, files) => {
        if(err) {
          res.send({
            code: 1000,
            type: 'FORM_DATA_ERROR',
            msg: '表单信息错误'
          })
        }

        try{

          const {
            avatar = {} // avatar为前端传过来--formData.append('avatar', avatarFile.files[0],avatarFile.files[0].name)
          } = files
          const {
            name,
            path: filePath
          } = avatar

          console.log('avatar----------:',avatar)

          if(!_.isEmpty(req.session.userBasicInfo)) {
            const {
              _id,
            } = req.session.userBasicInfo

            const userImgDir = path.join(__dirname,`../../public/srcImages/${_id}`)

            if(!fs.existsSync(userImgDir)) {
              fs.mkdirSync(userImgDir)
            }

            const imgLocalPath = path.join(__dirname,`../../public/srcImages/${_id}/${name}`)
            const fileData = fs.readFileSync(filePath)
            fs.writeFileSync(imgLocalPath, fileData)

            console.log('fileData---------:',fileData)

            const newUserInfo = await User.findOneAndUpdate({_id},{avatar:`/srcImages/${_id}/${name}`})

            newUserInfo.password = undefined
            newUserInfo.avatar = `/srcImages/${_id}/${name}`

            req.session.userBasicInfo = newUserInfo

            res.send({
              code: 0,
              data: newUserInfo,
              msg: '图片上传成功'
            })
          }else {
            res.send({
              code: 2000,
              type: 'LOGIN_INVALID_ERROR',
              msg: '用户登录已失效'
            })
          }
        }catch(e) {
          res.send({
            code: 1000,
            type: 'UPLOAD_ERROR',
            msg: e.message
          })
        }
      })
    }catch(e) {
      res.send({
        code: 1000,
        type: 'UPLOAD_AVATAR_ERROR',
        msg: '头像上传错误'
      })
    }
  }
}

export default new Admin