var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { USER_COLLECTION } = require('../config/collections')
const { response } = require('../app')

module.exports ={
   doSignup:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
        if(user){
            resolve({status:false})

        }else{
                      
            userData.password =await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response)=>{
            resolve({status:true})
        })
        }
       
        
    })
     
   },

   doLogin:(userLogged)=>{
    return new Promise(async(resolve,reject)=>{
        let loginStatus = false
        let response={}
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userLogged.email})
        if(user){
            if(user.block){  //userblocking
                console.log(user.block)
                console.log('login blocked')
                resolve({status:false})
            }
            bcrypt.compare(userLogged.password,user.password).then((status)=>{
                if(status){
                    console.log('login success')
                    response.user = user
                    response.status = true
                    resolve(response)
                }else{
                    console.log('failed')
                    resolve({status:false})
                }
            })
        }else{
            console.log('login failed')
            resolve({status:false})  
        }

    })
   }
}