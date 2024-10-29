require('dotenv').config()
const aws = require('aws-sdk')

class SendSms {
    constructor() {
        aws.config.update({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
        // Remove sessionToken if you're using permanent credentials
        // If you need temporary credentials, you'll need to refresh them regularly
    }

    async sendaws(PhoneNumber, msg) {
        try {
            const sms = new aws.SNS({ apiVersion: "2010-03-31" })
            const Message = `Você está recebendo o código ${msg} para usar na API - NIVALDO UNIFEOB`
            
            const result = await sms.publish({
                Message,
                PhoneNumber
            }).promise()
            
            console.log('SMS sent successfully:', result)
            return true
        } catch (error) {
            console.error('Error sending SMS:', error)
            throw new Error('Falha ao enviar SMS: ' + error.message)
        }
    }
}

module.exports = new SendSms()