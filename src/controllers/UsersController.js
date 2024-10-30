require('dotenv').config()
var User = require('../models/Users')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')

class UsersController{
    async create(req, res){
        try {
            const { name, email, password, phone, role } = req.body;
            
            if (!name || !email || !password || !phone || role === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os campos são obrigatórios'
                });
            }

            // validar cargo
            if (role !== 1 && role !== 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Função inválida'
                });
            }

            const result = await User.new(name, email, password, phone, parseInt(role));
            
            if (result.status) {
                return res.status(200).json({
                    success: true,
                    message: 'Usuário cadastrado com sucesso'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.err || 'Erro ao cadastrar usuário'
                });
            }
        } catch (error) {
            console.error('Create user error:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno ao criar usuário'
            });
        }
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

            // metodo instancia
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

    async login(req, res) {
        try {
            const { email, password } = req.body;
            console.log('Login attempt:', { email, password });

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email e senha são obrigatórios'
                });
            }

            const user = await User.findByEmail(email);
            console.log('Found user:', user);

            if (!user || !user.status) {
                return res.status(406).json({
                    success: false,
                    message: 'E-mail não encontrado'
                });
            }

            const isPassword = bcrypt.compareSync(password, user.values.password);
            console.log('Password match:', isPassword);
            
            if (isPassword) {
                const token = jwt.sign(
                    {
                        email: user.values.email, 
                        role: user.values.role,
                        id: user.values.id // add ID no token
                    },
                    process.env.SECRET,
                    { expiresIn: '1h' } // aumentar tempo de expiração do token
                );
                
                return res.status(200).json({
                    success: true, 
                    token: token,
                    role: user.values.role
                });
            } else {
                return res.status(406).json({
                    success: false, 
                    message: 'Senha inválida'
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno no servidor'
            });
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
            console.log('Deleting user:', id); // Debug
            
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
            
            const userId = req.userId; 
            const user = await User.findById(userId);
            
            if (!user.status) {
                return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
            }

            // retorna dados do usuario
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

    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, email e senha são obrigatórios'
                });
            }

            // Set default values for new registrations
            const phone = ''; // Optional phone
            const role = 2;   // Regular user role

            const result = await User.new(name, email, password, phone, role);
            
            if (result.status) {
                return res.status(200).json({
                    success: true,
                    message: 'Conta criada com sucesso'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.err || 'Erro ao criar conta'
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno ao criar conta'
            });
        }
    }
}

module.exports = new UsersController()