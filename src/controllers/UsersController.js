require('dotenv').config()
var User = require('../models/Users')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')

class UsersController{
    async create(req, res){
        let {name, email, password, phone, role} = req.body
        
        let result = await User.new(name, email, password,phone,role)
        result.status
        ? res.status(200).json({sucess: true, massage:"Usuário Cadastrado com Sucesso"})
        : res.status(404).json({sucess: false, message: result.err})
    }
    async findAll(req, res){
        let users = await User.findAll()
        users.status
        ? res.status(200).json({sucess: true, values: users.values})
        : res.status(404).json({sucess: false, message: users.err})
    }
    async findUser(req, res){
        let id = req.params.id
        if (isNaN(id)){
            return res.status(404).json({sucess: false, message:'Parametros Invalidos'})
        }else{
            let user = await User.findById(id)
            if (user.status == undefined)
                res.status(406).json({sucess: false, massage:"Usuário não encontrado"})
            else if (!user.status)
                res.status(404).json({sucess: false, message: result.err})
            else
                res.status(200).json({sucess: true, massage:user.values})
        }
    }

    async remove(req, res){
        let id = req.params.id
        if(isNaN(id)){
            return res.status(404).json({sucess: false, message:'Parametro Inválido'})
        }else{
            let result = await User.delete(id)
            result.status 
            ? res.status(200).json({sucess: result.status, message: result.message})
            : res.status(406).json({sucess: result.status, message: result.err})
        }
    }
    async editUser(req, res){
        let id = req.params.id
        let {name, email, role} = req.body
        if(isNaN(id)){
            return res.status(404).json({sucess: false, message:'Parametro Inválido'})
        }else{
            let result = await User.update(id, name, email, role)
            result.status 
            ? res.status(200).json({sucess: result.status, message: result.message})
            : res.status(406).json({sucess: result.status, message: result.err})
        }
    }

    async login(req,res){
        let {email, password} = req.body
        let user = await User.findByEmail(email)
        if (!user.status){
            user.err === undefined
            ? res.status(406).json({sucess: user.status, message: 'E-mail não encontrado'})
            : res.status(404).json({sucess: user.status, message: user.err})
        }else{

            let isPassword = bcrypt.compareSync(password, user.values.password)

            if (isPassword){

                let token = jwt.sign({email: user.values.email, role: user.values.role},process.env.SECRET,{expiresIn: 600})
                res.status(200).json({sucess: isPassword, token: token})

            }else{
                res.status(406).json({sucess: isPassword, message: 'Senha Inválida'})
            }
        }
    }
    async editPass(req, res){
        let id = req.params.id
        let {newpassword, code} = req.body
        if(isNaN(id)){
            return res.status(404).json({sucess: false, message:'Parametro Inválido'})
        }else{
            let salt = bcrypt.genSaltSync(10)
            let newpasshash = bcrypt.hashSync(newpassword, salt)

            let result = await User.alterPass(id, newpasshash)

            result.status
            ? res.status(200).json({sucess: result.status, message: result.message})
            : res.status(404).json({sucess: result.status, message: result.err})

        }

    }
}

module.exports = new UsersController