const { response } = require('../app')

var accountSid ='AC3f74062b96c03d1722a2cd47c77ff8a8'
var authToken = '4f6ab5fa70ebe78a3a15fc0542f4b985'
var serviceId = 'VA4dcd320c9ec21aaa544cc5491e1cbc29'
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