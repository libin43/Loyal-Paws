var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports ={
    addProduct:(adminData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(adminData).then((data)=>{
               
                resolve(data.insertedId)
            })
        })
    },
    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let prod_data = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            console.log(prod_data);
            resolve(prod_data) 
        })
    },
    deleteProduct:(prodID)=>{
        return new Promise((resolve,reject)=>{
            console.log(prodID)
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodID)}).then((response)=>{
                resolve(response)
            })
        })
    },

     getProductDetails:(prodID)=>{
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodID)}).then((prod_data)=>{
                console.log(prod_data)
                resolve(prod_data)
             })
        })
     },

     updateProduct:(prodID,productDetails)=>{
        productDetails.price = parseInt(productDetails.price)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(prodID)},{
                $set:{
                    
                    product: productDetails.product,
                    description: productDetails.description,
                    category:productDetails.category,
                    price:productDetails.price,
                    imageMany:productDetails.imageMany
                    
                }
            }).then((response)=>{
                resolve()
            })

        })

     },

     
     fetchImages:(prodID)=>{
        return new Promise(async(resolve,reject)=>{
            let data = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodID)})
            console.log(data)
            resolve(data.imageMany)
        })
     },

     getProductFromCategory:(catName)=>{
        return new Promise(async(resolve,reject)=>{
            let prodCat = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:catName}).toArray()
            console.log(prodCat,'hai testtttttttttttttttt')
            resolve(prodCat)
        })
       
     }
}