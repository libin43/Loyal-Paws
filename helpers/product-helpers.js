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
            let prod_data = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({_id:-1}).toArray()
            console.log(prod_data);
            resolve(prod_data) 
        })
    },
    deleteProduct:(prodID)=>{
        return new Promise((resolve,reject)=>{
            console.log(prodID)
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodID)}).then((response)=>{
                resolve({prodDeleted:true})
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
                    categoryOffer:productDetails.categoryOffer,
                    mrp:productDetails.mrp,
                    productOffer:productDetails.productOffer,
                    price:productDetails.price,
                    totalOffer:productDetails.totalOffer,
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
       
     },

     updateCategoryModedProduct:(catOffer,catName)=>{
         let categoryOffer = parseInt(catOffer)
         console.log(categoryOffer,catName)
        return new Promise((resolve,reject)=>{ 

            //updating offer changed in category into product collection
            db.get().collection(collection.PRODUCT_COLLECTION).updateMany({category:catName},{$set:{categoryOffer:categoryOffer}})
            
            .then(()=>{

                //updating the totalOffer field inside product collection
                db.get().collection(collection.PRODUCT_COLLECTION).updateMany(

                    {category:catName},

                    [ {$set:{totalOffer:{$add:['$categoryOffer','$productOffer']}}} ]
                    
                    ).then(()=>{ 

                        //updating the price field inside product collection
                        db.get().collection(collection.PRODUCT_COLLECTION).updateMany(

                            {category:catName},

                            [ {$set: { price:{ $subtract: ['$mrp', {$multiply: [ '$mrp' ,{ $divide: ['$totalOffer',100] }]} ] } }} ]

                            ).then(()=>{

                                //updating price field to avoid decimals

                                db.get().collection(collection.PRODUCT_COLLECTION).updateMany(
                                    
                                    {category:catName},
                                    
                                    [ {$set:{ price:{$round:['$price']} }} ]
                                    
                                    ).then(()=>{

                                        resolve()
                                        
                                    })

                               

                            })
                       

                    })
                    
               
            })
        })
     }
}