require('dotenv').config()
const aws = require('aws-sdk')

class SendSms {
    constructor() {
        aws.config.update({
            region: 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
    }

    async sendaws(PhoneNumber, msg) {
        try {
            console.log('Initializing SNS with config:', {
                region: aws.config.region,
                hasCredentials: !!aws.config.credentials,
                phoneNumber: PhoneNumber,
                messageLength: msg.length
            });

            const sns = new aws.SNS({ 
                apiVersion: "2010-03-31",
                region: 'us-east-1'
            })

            const params = {
                Message: `Você está recebendo o código ${msg} para usar na API - OBRIGADO POR USAR A UNIFEOB`,
                PhoneNumber,
                MessageAttributes: {
                    'AWS.SNS.SMS.SMSType': {
                        DataType: 'String',
                        StringValue: 'Transactional'
                    }
                }
            }

            console.log('Publishing SMS with params:', JSON.stringify(params, null, 2));

            const result = await sns.publish(params).promise()
            
            console.log('SMS sent successfully:', {
                messageId: result.MessageId,
                requestId: result.$response.requestId,
                timestamp: new Date().toISOString()
            });

            return true
        } catch (error) {
            console.error('SMS sending failed:', {
                errorCode: error.code,
                errorMessage: error.message,
                requestId: error.requestId,
                statusCode: error.statusCode,
                region: aws.config.region,
                phoneNumber: PhoneNumber,
                stack: error.stack
            });
            throw new Error(`Falha ao enviar SMS: ${error.message}`)
        }
    }
}

module.exports = new SendSms()