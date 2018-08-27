import express from 'express'
import Admin from '../controller/admin/admin'


const router = express.Router()

router.post('/regist', Admin.regist)
router.post('/login', Admin.login)
router.post('/modifyPassWord', Admin.modifyPassWord)
router.post('/addNickName', Admin.addNickName)

export default router