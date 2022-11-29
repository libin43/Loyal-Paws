var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { USER_COLLECTION, PRODUCT_COLLECTION } = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const {uid} =require('uid')

//Razorpay integration
let  instance = new Razorpay({
  key_id: 'rzp_test_bZDcL6JRT4zjki',
  key_secret: '1z5GxYh1NbBUCujrkqB10Okj',
});


module.exports ={
   doSignup:(userData)=>{
    console.log(userData,'lets start')
    return new Promise(async(resolve,reject)=>{
        let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
        if(user){
            resolve({status:false})

        }
        
        else{
            userData.referalId = uid()
            userData.wallet =0 
            userData.walletHistory =[]    
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



   getUserDetails:(userID)=>{
    return new Promise(async(resolve,reject)=>{
        let userDetails = await db.get().collection(collection.USER_COLLECTION).aggregate([

            {$match : { _id : objectId(userID)}} ,

            {$project:{
                name:1,
                email:1,
                phone:1,
                image:1
            }}

        ]).toArray()
        

        resolve(userDetails[0])
        reject("Login First")
    })

   },

   checkReferral:(userID,userName,inputReferral)=>{
    return new Promise(async(resolve,reject)=>{
        console.log(userID,'helper callled')
        let userWithReferral = await db.get().collection(collection.USER_COLLECTION).findOne({referalId: inputReferral})
        if(userWithReferral!=null){
            console.log(userWithReferral,'referal given user details')
            let walletObj = {
                date : new Date(),
                title:'Referal Code',
                walletdetail:'Rs.100 credited through Referral Code',
                amount:100,
                user:userWithReferral.name

            }
            let referredWalletObj = {
                date : new Date(),
                title:'Referral Code',
                walletdetail:'Rs.200 credited by using your Referral Code',
                amount:200,
                user:userName
            }

            db.get().collection(collection.USER_COLLECTION).updateOne(

                {_id:objectId(userID)},

                {
                   $inc: { wallet : 100},
                   $push:{
                    walletHistory:walletObj
                   }
                }
                
                ).then(()=>{
                    db.get().collection(collection.USER_COLLECTION).updateOne(
                        {_id:objectId(userWithReferral._id)},

                        {
                            $inc: { wallet : 200},
                            $push:{
                             walletHistory:referredWalletObj
                            }
                        }
                    ).then(()=>{
                        console.log(walletObj.amount,'checking+')
                        let showAmount = walletObj.amount
                        console.log('All set in helpers')
                        resolve({referralValid:true,showAmount})
                    })
                })
  
        }
        else{
            resolve({invalidReferral:true})
        }
    })
   },

//walletRef = wallet+walletHistory+referralId
   getWallet:(userID)=>{
    return new Promise(async(resolve,reject)=>{
       let walletRef = await db.get().collection(collection.USER_COLLECTION).aggregate([
        {$match: {_id: objectId(userID)} },
        {$project: {referalId:1,wallet:1,walletHistory:1} },
        {$limit:5}
       ]).toArray()
       console.log(walletRef[0],'helpers')
       resolve(walletRef[0])
    })
   },

   getFilteredWallet:()=>{

   },

   updateUserDetails:(userID,userDetail)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION)
        .updateOne(

            { _id:objectId(userID) },

            { $set: {
                name:userDetail.name,
                email:userDetail.email,
                phone:userDetail.phone,
                image:userDetail.image
                
            }},

            { upsert : true }
        )
        .then(()=>{
            resolve()
        })
    })
   },

   fetchImage:(userID)=>{
    return new Promise(async(resolve,reject)=>{
        let data = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userID)})
        console.log(data)
        resolve(data.image)
    })
 },

   addUserAddress:(userID,userAddress)=>{
    let Address ={
        user: objectId(userID),
        firstName: userAddress.fname,
        lastName: userAddress.lname,
        mobile: userAddress.mobile,
        address: userAddress.address,
        town: userAddress.town,
        pin: userAddress.pin,
    }
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ADDRESS_COLLECTION).insertOne(Address).then(()=>{
            resolve()
        })
    })
   },

   getUserAddress:(userID)=>{
    return new Promise(async(resolve,reject)=>{
        let allAddress = await db.get().collection(collection.ADDRESS_COLLECTION).find(
            { user: objectId(userID)}
        ).sort({_id:-1}).toArray()
        console.log(allAddress,'ggggggggggggggggggggggggggggggg');
        resolve(allAddress)
    })

   },

   deleteUserAddress:(addressID)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: objectId(addressID)})
        .then((response)=>{
            resolve({ deletedAddress:true })
        })
    })
   },

   getSelectedAddress:(addressID)=>{
    return new Promise(async(resolve,reject)=>{
        let selectedAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne( { _id: objectId(addressID) })
        console.log(selectedAddress,'helperrrrrrrrrrrrrrr');
            resolve({selectedAddress})
       
    })
   },







   addToCart:(prodID,userID)=>{
    let prodObj = {
        item: objectId(prodID),
        quantity: 1
    }
    return new Promise(async(resolve,reject)=>{
        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userID)})

        if(userCart){
            let prodExist = userCart.products.findIndex(product=> product.item == prodID)
            console.log(prodExist);

            if (prodExist != -1) {
                db.get().collection(collection.CART_COLLECTION).updateOne(
                    { user: objectId(userID), 'products.item': objectId(prodID) },
                    { $inc: { 'products.$.quantity': 1 } }
                ).then((response) => {
                    resolve()
                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userID) }, {
                    $push: {
                        products: prodObj
                    }
                }).then((response) => {
                    resolve()
                })
            }
             
        }
        else{
            let cartObj = {
                user: objectId(userID),
                products: [prodObj]
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
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'cartItems'
                }
            },
            {
                $project:{
                    item:1,
                    quantity:1,
                    cartItems:{$arrayElemAt:['$cartItems',0]}
                }
            },
       
            {
                $project:{
                    item:1,
                    quantity:1,
                    cartItems:1,
                    productPriceTotal:{$multiply:['$quantity','$cartItems.price']}

                }
            }

            // {$lookup:{
            //     from: collection.PRODUCT_COLLECTION,
            //     let:{prodList:'$products'},
            //     pipeline:[{
            //         $match:{
            //             $expr:{
            //                 $in:['$_id','$$prodList']
            //             }
            //         }
            //     }],
            //     as:'cartItems'
            // }}
        ]).toArray()
         console.log(cartItems,'logigin final')
        resolve(cartItems)
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

   changeProductQuantity:(details)=>{
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)
   
    return new Promise((resolve,reject)=>{
        if(details.count==-1 && details.quantity==1){
            db.get().collection(collection.CART_COLLECTION).updateOne(
                {_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        }
        else{
            db.get().collection(collection.CART_COLLECTION).updateOne(
                {_id:objectId(details.cart),'products.item':objectId(details.product)},
                {$inc: {'products.$.quantity':details.count}}
            ).then((response)=>{
                resolve({status:true})
            })
        }
    })
   },

   deleteCartProduct:(details)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CART_COLLECTION).updateOne(
            {_id:objectId(details.cart)},
            {
                $pull:{products:{item:objectId(details.product)}}
            }
        ).then((response)=>{
            resolve({deleteProduct:true})
        })
    })

   },

   totalPrice:(userID)=>{
    return new Promise(async(resolve,reject)=>{
        let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
            {$match:{user: objectId(userID)}} ,
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'cartItems'
                }
            },
            {
                $project:{
                    item:1,
                    quantity:1,
                    cartItems:{$arrayElemAt:['$cartItems',0]}
                }
            },
            {
                $group:{
                    _id:null,
                    total:{ $sum:{ $multiply:['$quantity','$cartItems.price']}}
                }
            }
        ]).toArray()

        if (total<1){
            resolve(0)
           
        }
        else{
            console.log(total,'this is total')
            resolve(total[0].total)
        }
        
    })
   },

//    totalProductPrice:(userID)=>{
//     return new Promise(async(resolve,reject)=>{
//         let productTotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
            
//             {$match:{user: objectId(userID)}},
            
//             {$unwind:'$products'},
            
//             {$project:{item:'$products.item',quantity:'$products.quantity'}},
            
//             {$lookup:{from:'PRODUCT',localField:'item',foreignField:'_id',as:'cartItems'}},
            
//             {$project:{item:1,quantity:1,cartItems:{$arrayElemAt:['$cartItems',0]}}},
            
//             {$project:{item:1,quantity:1,price:'$cartItems.price'}},
            
//             {$project:{item:1,quantity:1,productTotal:{$multiply:['$quantity','$price']}}}
        
//         ]).toArray()
//         console.log(productTotal,'product total got in helper')
//         resolve(productTotal)
//     })
//    },

   placeOrder:(order,products,total,noCouponTotal,discount)=>{
    return new Promise((resolve,reject)=>{
      
        console.log(order,products,total);
       
        let status = order['payment-method'] ==='COD'? 'Placed':'Pending'

      //-----status field is pushed into products array of objects----//
      console.log(status,'impppppppppppppppppppppp')
        products.forEach(products=>{
            products.status = status
        })
         //--------Pushing completed--------//

        let orderObj ={
            deliveryDetails:{
                name:order.fname+" "+order.lname,
                mobile:order.mobile,
                address:order.address,
                town:order.town,
                pincode:order.pin,
                
            },
            userId: objectId(order.userID),
            noCouponTotal:noCouponTotal,
            discount:discount,
            paymentMethod:order['payment-method'],
            products:products,
            totalAmount:total,
            date: new Date(),
          
           
        }
        
        db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
            
            if (status=='Placed'){
            db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userID)})

            }
         
          
            console.log(response.insertedId);
            resolve(response.insertedId)// This is done to pass order id to razorpay so far 
            
        })
   })

   },

   returnOrder:(orderID,itemID,returnStat)=>{
    console.log(orderID,'ret');
    
    console.log(itemID,'ret');
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
           { $and :[ {_id : objectId(orderID)}, {'products.item': objectId(itemID)}]},
           {
            $set: {
                'products.$.status' : returnStat
            }
           }
        ).then(()=>{
            resolve({status:true,orderID,itemID})
        })
    })
   },

   cancelOrder:(orderID,itemID,cancelStat)=>{
    console.log(orderID,'oderseeeeeeeeeeeeeeeeeeee');
    
    console.log(itemID,'oderseeeeeeeeeeeeeeeeeeee');
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne(
           { $and :[ {_id : objectId(orderID)}, {'products.item': objectId(itemID)}]},
           {
            $set: {
                'products.$.status' : cancelStat
            }
           }
        ).then(()=>{
            resolve({status:true,orderID,itemID})
        })
    })
   },

   getOrderTotalQuantity:(orderID)=>{
    return new Promise(async(resolve,reject)=>{
        let TotalQuantity = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            
            {$match:{_id:objectId(orderID)}},
            
            {$unwind:'$products'},
            
            {$group:{_id:null,totalQuantity:{$sum:'$products.quantity'}}}
        
        ]).toArray()

        let totalOrderQuantity = TotalQuantity[0]
        console.log(totalOrderQuantity)
        resolve(totalOrderQuantity.totalQuantity)
    })
   },


   getCancelOrderDetail:(orderID,itemID,totalQuantity)=>{
    return new Promise(async(resolve,reject)=>{
        let cancelOrderDetail = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            
            {$match:{_id: objectId(orderID)}},
            
            {$unwind:'$products'},{$match:{'products.item': objectId(itemID)}},
            
            {$project:{userId:1,discount:1,paymentMethod:1,totalAmount:1,product:'$products.item',quantityCancelled:'$products.quantity'}},
            
            {$lookup:{from:'PRODUCT',localField:'product',foreignField:'_id',as:'Product'}},
            
            {$project:{userId:1,discount:1,paymentMethod:1,totalAmount:1,quantityCancelled:1,Product:{$arrayElemAt:['$Product',0]}}},
            
            {$project:{userId:1,discount:1,paymentMethod:1,totalAmount:1,quantityCancelled:1,product:'$Product.product',price:'$Product.price'}}
        
        ]).toArray()
        console.log(cancelOrderDetail,'cancel order detail in helper')
        if(cancelOrderDetail!=null){
            resolve({cancelOrderDetail,totalQuantity,cancelledOrderDetail:true})
        }
        else{
            reject()
        }
    })
   },

   updateCancelledInWallet:(userID,productName,orderID,refund,paymentMethod)=>{
    return new Promise((resolve,reject)=>{
        let walletObj = {
            date : new Date(),
            title: paymentMethod,
            walletdetail:'Rs.'+refund+' credited for return on order cancellation of '+productName+' with order number '+orderID,
            amount:refund,
            

        }
        db.get().collection(collection.USER_COLLECTION).updateOne(
            {_id:objectId(userID)},

            {
                $inc: { wallet : refund},
                $push:{
                 walletHistory:walletObj
                }
            }
        ).then(()=>{
            resolve({updatedWallet:true})
        })
    })
   },

   
    getCartProductList:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userID)})
            resolve(cart.products)
            
        })
    },

    getOrderDetails:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            let orderList = await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userID)}).sort({_id:-1}).toArray()
            console.log(orderList[0])
            resolve(orderList)

        })
    },

    getOrderProductDetails:(orderID)=>{
        return new Promise(async(resolve,reject)=>{
            let orderProductList = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {$match:{_id:objectId(orderID)}},

                {$unwind:'$products'},

                {$project:{
                    item:'$products.item',
                    quantity:'$products.quantity',
                    name:'$deliveryDetails.name',
                    mobile:'$deliveryDetails.mobile',
                    address:'$deliveryDetails.address',
                    town:'$deliveryDetails.town',
                    pincode:'$deliveryDetails.pincode',
                    status:'$products.status',
                    date:'$date',
                    noCouponTotal:'$noCouponTotal',
                    discount:'$discount',
                    total:'$totalAmount'
                }},

                {$lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'orderProducts'
                }},

                {$project:{
                    item:1,
                    quantity:1,
                    name:1,
                    mobile:1,
                    address:1,
                    town:1,
                    pincode:1,
                    status:1,
                    date:1,
                    noCouponTotal:1,
                    discount:1,
                    total:1,
                    orderProduct:{$arrayElemAt:['$orderProducts',0]}
                }}

                
            ]).toArray()
            console.log(orderProductList[0])
            resolve(orderProductList)
        })
    },

    generateRazorpay:(orderID,total)=>{
        return new Promise((resolve,reject)=>{
            let options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ''+orderID  //to get receipt from razorpay we concatenate string to get it as a string
              };
              instance.orders.create(options, function(err, order) {
                console.log(order,'this is the order');
                resolve(order)
              });
            
        })
    },

    // hmac.digest is used to convert hmac to sting
    verifyPayment:(razorDetail)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256','1z5GxYh1NbBUCujrkqB10Okj')
            hmac.update(razorDetail['payment[razorpay_order_id]'] + "|" + razorDetail['payment[razorpay_payment_id]'],)

            hmac = hmac.digest('hex')    

            if(hmac == razorDetail['payment[razorpay_signature]'] ){
                resolve()
            }
            else{
                reject()
            }

        })
    },

    changePaymentOrderStatus:(orderID,userID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: objectId( orderID )},
            {
                $set:{
                    'products.$[].status':'Placed',
                   
                }
            }).then(()=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(userID)})

                resolve()
            })
        })
    },

    removePendingStatus:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).deleteMany( { products: {$elemMatch: { status:'Pending' } } }).then(()=>{
                resolve()
            })
           
        })
    },

    searchProduct:(searchData)=>{
        console.log(searchData,"LLLLLLLLLLLLLLLLLLLLLL");
        return new Promise(async(resolve,reject)=>{
            var re = new RegExp(searchData, "i");
            console.log(re,"reeeeeeeeee");
           let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({product:re}).toArray()
           console.log(products)
           if(products.length==0){
            console.log('hiting')
            reject({productNotFound:true})

           }
           else{
            console.log(products,'haaaaaaaayeeeeeeeeeee')
            resolve(products)
           
           }
           
        })
    },

    filterPrice:(min,max)=>{
        console.log(min,max)
        min = parseInt(min)
        max = parseInt(max)
        return new Promise(async(resolve,reject)=>{
         let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({price:{$gte:min,$lte:max}}).toArray()
         resolve(products)
        })
    },

    getOrderPaymentDetail:(orderID)=>{
        return new Promise(async(resolve,reject)=>{
            let orderDetail = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderID)})
            console.log(orderDetail.paymentMethod,'paymentdetail helper')
            let orderPaymentMethod = orderDetail.paymentMethod
            resolve(orderPaymentMethod)
        })
    },



   
}