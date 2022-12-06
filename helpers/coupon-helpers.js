var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId


module.exports ={
    addCoupon:(couponDetail)=>{
       return new Promise((resolve,response)=>{
        db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetail).then(()=>{
            resolve()
        })
       })
    },

    getAllCoupon:()=>{
        return new Promise(async(resolve,reject)=>{
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupons,'hellloooooooooooooooooooooooooooooooo')
        })
    },

    deleteCoupon:(couponID)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponID)}).then((response)=>{
            resolve({couponDeleted:true})
        })
      })
    },

    existCoupon:(coupon)=>{
        console.log(coupon,'recieved in helper')
        return new Promise(async(resolve,reject)=>{
            let couponExist = await db.get().collection(collection.COUPON_COLLECTION).findOne({code:coupon})
            if(couponExist!=null){
                // resolve(couponExist)
                // console.log(couponExist)

               let couponNotExpired = await db.get().collection(collection.COUPON_COLLECTION).findOne( { _id:couponExist._id, expiry:{$gte:new Date()}, addDate:{$lte:new Date()}} )
               if(couponNotExpired!=null){
                 resolve(couponNotExpired)
            console.log(couponNotExpired,'not expired')
        


               }else{
                console.log('coupon expired')
                reject({couponExpired:true})
                
               }
                 
               
                
            }else{
                reject({Invalid:true})
            }    
   
        })
    },

    checkCouponExpire:()=>{

    }
}