require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/Users')
const authcode = require('../service/authCode')
const SendSms = require('../service/sendSms')

class RecoverPassController{

        async request(req, res){
            let {email} = req.body
            let user = await User.findByEmail(email)

            if ( !user.status){
                user.err === undefined 
                ? res.status(404).json({sucess: user.status, message: 'Email não Encontrado'})
                : res.status(404).json({sucess: user.status, message: user.err})
            }else{
                let code = authcode.code()
                SendSms.sendaws(`55${user.values.phone}`,code.toString())
                let token = jwt.sign({email: user.values.email, authcode: code}, process.env.SECRET, {expiresIn: 900})
                res.status(200).json({sucess: true, massage: token})

            }

        }


}

module.exports = new RecoverPassController()