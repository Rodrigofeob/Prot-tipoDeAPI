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

    async remove(req, res) {
        try {
            const id = req.params.id;
            console.log('Controller: Attempting to delete user:', id);

            if (isNaN(id)) {
                console.log('Invalid ID:', id);
                return res.status(400).json({
                    success: false, 
                    message: 'ID Inválido'
                });
            }

            // Now using the instance method
            const result = await User.delete(parseInt(id));
            console.log('Delete result:', result);

            if (result.status) {
                return res.status(200).json({
                    success: true, 
                    message: 'Usuário excluído com sucesso'
                });
            } else {
                return res.status(400).json({
                    success: false, 
                    message: result.err || 'Erro ao excluir usuário'
                });
            }
        } catch (error) {
            console.error('Controller error:', error);
            return res.status(500).json({
                success: false, 
                message: 'Erro interno ao excluir usuário: ' + error.message
            });
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
        
        console.log('Login attempt:', { email, password });
        
        let user = await User.findByEmail(email)
        console.log('Found user:', user);
        
        if (!user.status){
            user.err === undefined
            ? res.status(406).json({success: false, message: 'E-mail não encontrado'})
            : res.status(404).json({success: false, message: user.err})
        } else {
            console.log('Comparing passwords:');
            console.log('Input password:', password);
            console.log('Stored hash:', user.values.password);
            
            let isPassword = bcrypt.compareSync(password, user.values.password)
            console.log('Password match:', isPassword);
            
            if (isPassword){
                let token = jwt.sign(
                    {
                        email: user.values.email, 
                        role: user.values.role
                    },
                    process.env.SECRET,
                    {expiresIn: 600}
                )
                
                res.status(200).json({
                    success: true, 
                    token: token,
                    role: user.values.role
                })
            } else {
                res.status(406).json({success: false, message: 'Senha Inválida'})
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
    async delete(req, res) {
        try {
            const id = req.params.id;
            console.log('Deleting user:', id); // Debug log
            
            const result = await User.delete(id);
            
            if (result.status) {
                res.json({ success: true, message: 'Usuário excluído com sucesso' });
            } else {
                res.status(400).json({ success: false, message: result.err });
            }
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({ success: false, message: 'Erro interno ao excluir usuário' });
        }
    }
    async getCurrentUser(req, res) {
        try {
            // The user ID should be available from the Auth middleware
            const userId = req.userId; // Make sure your Auth middleware sets this
            const user = await User.findById(userId);
            
            if (!user.status) {
                return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
            }

            // Return only necessary user data
            res.json({
                success: true,
                name: user.values.name,
                email: user.values.email
            });
        } catch (error) {
            console.error('Error getting current user:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar dados do usuário' });
        }
    }
}

module.exports = new UsersController()