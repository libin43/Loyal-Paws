var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId

module.exports ={
    addToWishList: (prodID, userID) => {
        return new Promise(async (resolve, reject) => {
            let userWishList = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userID) })

            if (userWishList) {
                db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
                    { user: objectId(userID) },
                    { $addToSet: { productWish: objectId(prodID) } })
                    .then(()=>{
                        resolve()
                    })
            }
            else {
                wishObj = {
                    user: objectId(userID),
                    productWish: [objectId(prodID)]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(
                    { user: objectId(userID), productWish: [objectId(prodID)] }

                ).then(()=>{
                    resolve()
                })
            }


        })
    },

    getWishList:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            let wishProducts = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                
                {$match:{user:objectId(userID)}},
                
                {$unwind:'$productWish'},{$project:{productWish:1}},
                
                {$lookup:{from:'PRODUCT',localField:'productWish',foreignField:'_id',as:'wishItems'}},
                
                {$project:{wishItems:{$arrayElemAt:['$wishItems',0]} }}
            
            ])
              .toArray()
              resolve(wishProducts)
        })
    },

    deleteWishProduct:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
                {_id:objectId(details.wishID)},
                {
                    $pull:{productWish:objectId(details.prodID)}
                }
            ).then((response)=>{
                resolve({deleteWishProduct:true})
            })
        })
    
       },

       getWishCount:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            let count =0
           let wishList= await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userID)})
           if(wishList){
            count = wishList.productWish.length
           }
           resolve(count)
        })
       },
}