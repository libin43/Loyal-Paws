var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { USER_COLLECTION, PRODUCT_COLLECTION } = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId

module.exports ={
   doSignup:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
        if(user){
            resolve({status:false})

        }
        
        else{
                      
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
           
            bcrypt.compare(userLogged.password,user.password).then((status)=>{
                if(status){
                    console.log('user blocked',user.block)
                    if(user.block){
                    
                        console.log('blocked')
                       
                        resolve({status:false})
                    }
                    else{
                        console.log('login success')
                        response.user = user
                        
                        response.status = true
                        resolve(response)
                    }
                   
                }else{
                    console.log('password wrong')
                    reject({status:true})
                }
            })
        }else{
            console.log('User Doesnt Exist')
            reject({status:false})  
        }

    })
   },

   checkPhone:(phoneData)=>{
    return new Promise(async(resolve,reject)=>{
        let response ={}
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({phone:phoneData.phone})
        if(user){
            if(user.block){
                resolve({status:false})
            }
            else{
                resolve({status:true})
            }
        }else{
           reject({status:false}) 
        }
    })
   },

   addToCart:(prodID,userID)=>{
    return new Promise(async(resolve,reject)=>{
        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userID)})
        if(userCart){
            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userID)},{
                $push:{
                    products: objectId(prodID)
                }
            }).then((response)=>{
                resolve()
            })
        }
        else{
            let cartObj = {
                user: objectId(userID),
                products: [objectId(prodID)]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                resolve()
            })
        }
    })
   },

   getCart:(userID)=>{
    return new Promise(async(resolve,reject)=>{
        let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {$match:{user: objectId(userID)}} ,

            {$lookup:{
                from: collection.PRODUCT_COLLECTION,
                let:{prodList:'$products'},
                pipeline:[{
                    $match:{
                        $expr:{
                            $in:['$_id','$$prodList']
                        }
                    }
                }],
                as:'cartItems'
            }}
        ]).toArray()
        resolve(cartItems[0].cartItems)
    })
   },

   getCartCount:(userID)=>{
    return new Promise(async(resolve,reject)=>{
        let count =0
       let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userID)})
       if(cart){
        console.log(cart)
        count = cart.products.length
       }
       resolve(count)
    })
   },
}