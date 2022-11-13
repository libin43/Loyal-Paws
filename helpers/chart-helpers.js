var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports={
    getPaymentGraph:()=>{
        return new Promise(async(resolve,reject)=>{
           let COD=await  db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        $and:[
                           { paymentMethod:'COD'},
                           { $expr: { $gt: [ "$date", { $dateSubtract: { startDate: "$$NOW", unit: "day", amount: 7 } }] } }
                        ]
                        
                    }
                },
                // {
                //      $match: { $expr: { $gt: [ "$date", { $dateSubtract: { startDate: "$$NOW", unit: "day", amount: 3 } }] } } 
                // },
                {
                    $group:{
                        _id:'$paymentMethod',
                        count:{$sum:1}
                    }
                }
            ]).toArray()

            let ONLINE = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        $and:[
                           { paymentMethod:'ONLINE'},
                           { $expr: { $gt: [ "$date", { $dateSubtract: { startDate: "$$NOW", unit: "day", amount: 7 } }] } }
                        ]
                        
                    }
                },

                {
                    $group:{
                        _id:'$paymentMethod',
                        count:{$sum:1}
                    }
                }

            ]).toArray()
            
            let PAYPAL = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        $and:[
                           { paymentMethod:'PAYPAL'},
                           { $expr: { $gt: [ "$date", { $dateSubtract: { startDate: "$$NOW", unit: "day", amount: 7 } }] } }
                        ]
                        
                    }
                },
                
                {
                    $group:{
                        _id:'$paymentMethod',
                        count:{$sum:1}
                    }
                }

            ]).toArray()
            // console.log('COD', COD[0], 'ONLINE', ONLINE[0] , 'PAYPAL',PAYPAL[0]);

            const payments={}
            payments.cod = COD[0].count,
            payments.online = ONLINE[0].count,
            payments.paypal = PAYPAL[0].count
            console.log(payments,'chus');
            resolve(payments)
        })
    },

    getTotalSales:()=>{
       return new Promise(async(resolve,reject)=>{
        let sales = await db.get().collection(collection.ORDER_COLLECTION).count()
        console.log(sales,'sssssssssssssssssssssssss');
        resolve(sales)
       })
    },

    // getTotalRevenue:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let revenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{

    //             $project:{
    //                 totalRevenue:{ $sum: "$totalAmount"}
    //             }
    //         }   

    //         ])
    //         console.log(revenue)
    //         resolve(revenue)
    //     })
    // }
}