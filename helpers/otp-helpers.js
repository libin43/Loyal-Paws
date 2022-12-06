const { response } = require('../app')
const env = require('dotenv').config()

var accountSid = process.env.twilio_Sid
var authToken = process.env.twilio_Token
var serviceId = process.env.twilio_Id
const client = require('twilio')(accountSid,authToken,serviceId)
let mobile
module.exports= {
    sendOtp:(phoneData)=>{
       mobile = phoneData
        return new Promise((resolve,reject)=>{
            client.verify.services(serviceId)
            .verifications.create({
                to: `+${mobile}`,
                channel: 'sms'
            })
            .then((data)=>{
                resolve({status:true})
            })
            .catch((err)=>{
                reject('sms not sent')
            })
        })
    },

    verifyOtp:(otpData)=>{

        return new Promise((resolve,reject)=>{
            client.verify.services(serviceId)
            .verificationChecks.create({
                to: `+${mobile}`,
                code: otpData
            })
            .then((response)=>{
                
                resolve('SUCCESS!')
            })
            .catch((err)=>{
                reject('Your otp doesnot match')
            })
        })
    }
}