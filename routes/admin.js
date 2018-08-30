import express from 'express'
import Admin from '../controller/admin/admin'


const router = express.Router()

router.post('/regist', Admin.regist)
router.post('/login', Admin.login)
router.post('/modifyPassWord', Admin.modifyPassWord)
router.post('/addNickName', Admin.addNickName)
router.post('/checkLogin', Admin.checkLogin)
router.post('/logout', Admin.logout)
router.post('/uploadAvatar', Admin.uploadAvatar)

export default router