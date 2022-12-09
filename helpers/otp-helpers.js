const { response } = require('../app')
const env = require('dotenv').config()

var accountSid = process.env.Twilio_sid
var authToken = process.env.Twilio_Token
var serviceId = process.env.Twilio_serviceid
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
                
                resolve(mobile)
            })
            .catch(()=>{
                reject('Your otp doesnot match')
            })
        })
    }
}