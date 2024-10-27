require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = function(req, res, next){
    const authToken = req.headers['authorization']

    if(authToken != undefined){
        const bearer = authToken.split(' ')
        let token = bearer[1]

        try {
            let decoded = jwt.verify(token,process.env.SECRET)
            return decoded.role == 1
            ? next()
            :res.status(403).json({sucess: false, message: 'Usuário sem permissão!'}) 
        } catch (err) {
            return res.status(403).json({sucess: false, message: 'Usuário não autenticado!'})
        }

    }else{
       return res.status(403).json({sucess: false, message: 'Usuário não autenticado!'})
    }
}