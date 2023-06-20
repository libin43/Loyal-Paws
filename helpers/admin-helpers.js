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
        resolve(orderLists)
    })
},

updateOrder:(orderID,itemID,orderStats,quantity)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
            { $and:[{_id:objectId(orderID)}, {'products.item':objectId(itemID) }]},
            {
                $set:{
                 'products.$.status':orderStats,
                }
            }
            ).then((response)=>{
                quantity = parseInt(quantity)
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(itemID)},
                {$inc:{stock:quantity}})
                .then((response)=>{
                    resolve({status:true,orderID,itemID,quantity})
                })
                .catch(()=>{
                    reject()
                })
            })
            .catch(()=>{
                reject()
            })
    })
},

updateorder:(orderID,itemID,orderStats)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
            { $and:[{_id:objectId(orderID)}, {'products.item':objectId(itemID) }]},
            {
                $set:{
                 'products.$.status':orderStats, 
                }
            }
            ).then(()=>{
                resolve({status:true,orderID,itemID})
            })
            .catch(()=>{
                reject()
            })
    })
},

validateCatName:(name)=>{
    return new Promise(async(resolve,reject)=>{
        var re = new RegExp(name, "i");
        let catExist = await db.get().collection(collection.CATEGORY_COLLECTION).find({category:re}).toArray()
        if(catExist.length==0){
            resolve()
        }
        else{
            reject()
        }
    })
}
}