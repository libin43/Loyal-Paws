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

   getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let orderLists = await db.get().collection(collection.ORDER_COLLECTION).find().sort({_id:-1}).toArray()
        console.log(orderLists[0])
        resolve(orderLists)

    })
},

updateOrder:(orderID,itemID,orderStats)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
            { $and:[{_id:objectId(orderID)}, {'products.item':objectId(itemID) }]},
            {
                $set:{
                 'products.$.status':orderStats,
                  
                }
            }
            ).then((response)=>{
                resolve({status:true,orderID,itemID})
            })
    })
}

   
   
}