require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = function(req,res,next){
    const authToken = req.headers['authorization']
    if(authToken === undefined){
        return res.status(403).json({sucess: false, message: 'Solicitação não Autenticada!'})
    }else{
        let bearer = authToken.split(' ')
        let token = bearer[1]

        try {
            let decoded = jwt.verify(token, process.env.SECRET)
            let code = req.body.code
            return decoded.authcode === code
                   ? next()
                   : res.status(403).json({sucess: false, message: 'Código Invalido!'})
            
        } catch (err) {
            return res.status(403).json({sucess: false, message: 'Solicitação não Autenticada!'})
        }


    }
}