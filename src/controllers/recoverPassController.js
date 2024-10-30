require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/Users')
const authcode = require('../service/authCode')
const SendSms = require('../service/sendSms')
const bcrypt = require('bcrypt')

class RecoverPassController{

        async request(req, res){
            const {email} = req.body
            console.log('Received password recovery request for email:', email);

            try {
                console.log('Looking up user...');
                const user = await User.findByEmail(email)
                console.log('User lookup result:', user);

                if (!user.status) {
                    console.log('User not found or error:', user.err);
                    return res.status(404).json({ 
                        success: false, 
                        message: user.err || 'Email não Encontrado' 
                    })
                }

                try {
                    const code = authcode.code()
                    console.log('Generated auth code:', code);
                    
                    const cleanPhone = user.values.phone.replace(/\D+/g, '')
                    const phoneNumber = cleanPhone.startsWith('55') 
                        ? `+${cleanPhone}`
                        : `+55${cleanPhone}`
                    
                    console.log('About to send SMS to:', phoneNumber);
                    console.log('User data:', user.values);
                    
                    await SendSms.sendaws(phoneNumber, code.toString())
                    
                    const token = jwt.sign(
                        { email: user.values.email, authcode: code },
                        process.env.SECRET,
                        { expiresIn: '15m' }
                    )
                    
                    return res.status(200).json({ 
                        success: true, 
                        token,
                        message: 'Código enviado com sucesso'
                    })
                    
                } catch (smsError) {
                    console.error('SMS sending error details:', {
                        error: smsError,
                        message: smsError.message,
                        stack: smsError.stack
                    });
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro ao enviar SMS: ' + smsError.message
                    })
                }
            } catch (error) {
                console.error('General error details:', {
                    error: error,
                    message: error.message,
                    stack: error.stack
                });
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro interno do servidor: ' + error.message
                })
            }
        }

        async verifyCode(req, res) {
            const { email, code, token } = req.body

            if (!email || !code || !token) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Dados incompletos' 
                })
            }

            try {
                const decoded = jwt.verify(token, process.env.SECRET)
                
                if (decoded.email !== email || decoded.authcode.toString() !== code.toString()) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Código inválido' 
                    })
                }

                return res.status(200).json({ 
                    success: true, 
                    message: 'Código verificado com sucesso' 
                })
            } catch (error) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Código expirado ou inválido' 
                })
            }
        }

        async updatePassword(req, res) {
            const { email, password, code, token } = req.body

            if (!email || !password || !code || !token) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Dados incompletos' 
                })
            }

            try {
                const decoded = jwt.verify(token, process.env.SECRET)
                
                if (decoded.email !== email || decoded.authcode.toString() !== code.toString()) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Verificação inválida' 
                    })
                }

                if (password.length < 6) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'A senha deve ter pelo menos 6 caracteres' 
                    })
                }

                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(password, salt)

                const updated = await User.updatePassword(email, hash)
                
                if (!updated) {
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro ao atualizar senha' 
                    })
                }

                return res.status(200).json({ 
                    success: true, 
                    message: 'Senha atualizada com sucesso' 
                })
            } catch (error) {
                console.error('Update password error:', error)
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao atualizar senha: ' + error.message 
                })
            }
        }

}

module.exports = new RecoverPassController()