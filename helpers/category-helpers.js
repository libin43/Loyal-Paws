var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('../app')
const productHelpers = require('./product-helpers')
var objectId = require('mongodb').ObjectId

module.exports ={
    addCategory:(adminData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(adminData).then((data)=>{  
                resolve(data.insertedId)
            })
        })
    },

    getAllCategory:()=>{
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.CATEGORY_COLLECTION).find().toArray().then((cat_data)=>{
                resolve(cat_data)
             })  
        })
    },

    deleteCategory:(catID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catID)}).then((response)=>{
                resolve({catDeleted:true})
            })
        })
    },

     getCategoryDetails:(catID)=>{
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catID)}).then((cat_data)=>{
                resolve(cat_data)
             })
        })
     },

     updateCategory:(catID,categoryDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catID)},{
                $set:{
                    category: categoryDetails.category,
                    description: categoryDetails.description,
                    categoryOffer: categoryDetails.categoryOffer,
                    image:categoryDetails.image
                }
            }).then(()=>{
                resolve()
            })
        })
     },

     fetchImage:(catID)=>{
        return new Promise(async(resolve,reject)=>{
            let data = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catID)})
            resolve(data.image)
        })
     },
     
     getCategoryOffer:(categoryName)=>{
        return new Promise(async(resolve,response)=>{
            let offerData = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:categoryName})
            resolve(offerData)
        })
     }
}
