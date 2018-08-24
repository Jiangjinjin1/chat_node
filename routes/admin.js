import express from 'express'


const router = express.Router()

router.post('/login', (req,res,err)=>{console.log('我进入了login')})

export default router