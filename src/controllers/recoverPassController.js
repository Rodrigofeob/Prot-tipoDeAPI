require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/Users')
const authcode = require('../service/authCode')
const SendSms = require('../service/sendSms')
const bcrypt = require('bcrypt')

class RecoverPassController{

        async request(req, res){
            let {email} = req.body
            try {
                let user = await User.findByEmail(email)

                if (!user.status) {
                    user.err === undefined
                        ? res.status(404).json({ success: false, message: 'Email não Encontrado' })
                        : res.status(404).json({ success: false, message: user.err })
                    return
                }

                try {
                    let code = authcode.code()
                    // First generate the token
                    let token = jwt.sign({ email: user.values.email, authcode: code }, process.env.SECRET, { expiresIn: 900 })
                    
                    // Then try to send the SMS
                    console.log('Attempting to send SMS to:', `55${user.values.phone}`);
                    await SendSms.sendaws(`55${user.values.phone}`, code.toString())
                    
                    // If SMS was sent successfully, return the token
                    res.status(200).json({ success: true, message: token })
                    
                } catch (smsError) {
                    console.error('SMS sending error:', smsError)
                    res.status(500).json({ 
                        success: false, 
                        message: 'Erro ao enviar SMS. Por favor, tente novamente mais tarde.' 
                    })
                }
            } catch (error) {
                console.error('General error:', error)
                res.status(500).json({ 
                    success: false, 
                    message: 'Erro interno do servidor' 
                })
            }
        }

        async verifyCode(req, res) {
            const { email, code, token } = req.body

            try {
                // Verify the token and check if the code matches
                const decoded = jwt.verify(token, process.env.SECRET)
                if (decoded.email === email && decoded.authcode.toString() === code.toString()) {
                    res.status(200).json({ success: true, message: 'Código verificado com sucesso' })
                } else {
                    res.status(400).json({ success: false, message: 'Código inválido' })
                }
            } catch (error) {
                res.status(400).json({ success: false, message: 'Código expirado ou inválido' })
            }
        }

        async updatePassword(req, res) {
            const { email, password, code, token } = req.body

            try {
                // Verify the token and code one last time
                const decoded = jwt.verify(token, process.env.SECRET)
                if (decoded.email === email && decoded.authcode.toString() === code.toString()) {
                    // Hash the new password
                    const salt = await bcrypt.genSalt(10)
                    const hash = await bcrypt.hash(password, salt)

                    // Update the password
                    const updated = await User.updatePassword(email, hash)
                    if (updated) {
                        res.status(200).json({ success: true, message: 'Senha atualizada com sucesso' })
                    } else {
                        res.status(500).json({ success: false, message: 'Erro ao atualizar senha' })
                    }
                } else {
                    res.status(400).json({ success: false, message: 'Código inválido' })
                }
            } catch (error) {
                console.error('Update password error:', error)
                res.status(500).json({ success: false, message: 'Erro ao atualizar senha' })
            }
        }

}

module.exports = new RecoverPassController()