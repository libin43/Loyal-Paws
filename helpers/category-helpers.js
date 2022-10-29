var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('../app')
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
        return new Promise(async(resolve,reject)=>{
            let cat_data = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(cat_data) 
        })
    },

    deleteCategory:(catID)=>{
        return new Promise((resolve,reject)=>{
            console.log(catID)
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catID)}).then((response)=>{
                resolve(response)
            })
        })
    },

     getCategoryDetails:(catID)=>{
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catID)}).then((cat_data)=>{
                console.log(cat_data)
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
                    
                }
            }).then((response)=>{
                resolve()
            })

        })

     }
}
