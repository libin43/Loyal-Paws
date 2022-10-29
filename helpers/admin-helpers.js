var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports={
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },

   blockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
            $set:{
                block:true
            }
        })
    })
   },

   unblockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
            $set:{
                block:false
            }
        })
    })
   },
   
}