const knex = require('../data/conection')
const bcrypt = require('bcryptjs')

class User {
    async new(name, email, password, phone, role, emergencyContact, healthInfo) {
        let salt = bcrypt.genSaltSync(10)
        let pass = bcrypt.hashSync(password, salt)
        try {
            await knex.insert({
                name: name, 
                email: email, 
                password: pass, 
                phone: phone, 
                role: role, 
                emergency_contact: emergencyContact, 
                health_info: healthInfo
            }).table('users')
            return {status: true }
        } catch (err) {
            return {status: false, err: err}
        }
    }

    async findAll() {
        try {
            let users = await knex
                .select(["id", "name", "email", "phone", "role", "emergency_contact", "health_info"])
                .table('users');
            return { status: true, values: users };
        } catch (err) {
            console.error('FindAll error:', err);
            return { status: false, err: err.message };
        }
    }

    async findById(id) {
        try {
            let user = await knex.select(["name", "email", "phone", "emergency_contact", "health_info"]).where({id: id}).table('users') // incluir campos
            return user.length > 0 ? {status: true, values: user } : {status: undefined, message: 'Usuário Inesistente!'}
        } catch (err) {
            return {status: false, err: err}
        }
    }

    async delete(id) {
        try {
            console.log('Attempting to delete user with ID:', id);
            
            // First check if user exists
            const user = await knex('users').where({ id: id }).first();
            if (!user) {
                console.log('User not found:', id);
                return { status: false, err: 'Usuário não encontrado' };
            }

            // Then delete
            const result = await knex('users')
                .where({ id: id })
                .del();
                
            console.log('Delete result:', result);
            
            return { status: true, message: 'Usuário excluído com sucesso' };
        } catch (err) {
            console.error('Delete error in model:', err);
            return { status: false, err: err.message };
        }
    }

    async update(id, name, email, role) {
        let user = await this.findById(id)
        if(user.status){
            let editUser = {}
            name != undefined ? editUser.name = name : null
            email != undefined ? editUser.email = email : null
            role != undefined ? editUser.role = role : null

            try {
                await knex.update(editUser).where({id:id}).table('users')
                return ({status: true, message:'Usuário editado com sucesso!'})
            } catch (err) {
                return ({status: false, err: err})
            }
        }else{
            return {status: false, err: 'Usuário não existe, portanto não pode ser deletado.'}
        }    
    }

    async findByEmail(email) {
        try {
            let user = await knex.select(['email','password','phone','role']).where({email:email}).table('users')
            return user.length > 0 ? {status: true, values: user[0]} : {status: false, err: undefined} 
        } catch (err) {
            return {status: false, err: err}
        }
    }

    async alterPass(id, newpassword) {
        let user = await this.findById(id)
        if(!user.status){
            return {status: false, err: 'Usuário não existe, portanto a senha não pode ser alterada.'}
        }else{
            try {
                await knex.update({password : newpassword}).where({id:id}).table('users')
                return {status: true, message: 'Senha alterada com sucesso!'}
            } catch (err) {
                return {status: false, err: err}
            }
        }
    }

    static async updatePassword(email, newPasswordHash) {
        try {
            // Implement the password update logic here
            // This is a generic example - adjust according to your database structure
            const result = await knex('users')
                .where({ email: email })
                .update({ password: newPasswordHash })
            return result > 0
        } catch (error) {
            console.error('Error updating password:', error)
            return false
        }
    }
}

module.exports = new User
    