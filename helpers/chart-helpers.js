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
       
          
            resolve(payments)
        })
    },

    getTotalSales:()=>{
       return new Promise(async(resolve,reject)=>{
        let sales = await db.get().collection(collection.ORDER_COLLECTION).count()
   
        resolve(sales)
       })
    },

    getTotalRevenue:()=>{
        return new Promise(async(resolve,reject)=>{
            let revenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{
                        _id:null,
                        total: {
                            $sum:'$totalAmount'
                        }
                    }
                }
            ]).toArray()
           
            resolve(revenue[0].total)
        })
    },

    getTotalUser:()=>{
        return new Promise(async(resolve,reject)=>{
            let customers = await db.get().collection(collection.USER_COLLECTION).count()
            resolve(customers)
        })
    },

    getSalesReport:()=>{
        return new Promise(async(resolve,reject)=>{
            let salesReport = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {$unwind:'$products'},

                {$group:{_id:'$products.item',totalQuantity:{$sum:'$products.quantity'}}},
                
                {$lookup:{ from:'PRODUCT',localField:'_id',foreignField:'_id',as:'productName'}},
                
                {$unwind:'$productName'},
                
                {$project:{name:'$productName.product',orderQuantity:'$totalQuantity',price:'$productName.price',revenue: { $multiply: [ "$totalQuantity", "$productName.price" ] }}}
            
            ]).toArray()
            console.log(salesReport)
            resolve(salesReport)
        })
    },

    getRecentSale:()=>{
        return new Promise(async(resolve,reject)=>{
            let recents = await db.get().collection(collection.ORDER_COLLECTION).find().sort({_id:-1}).limit(5).toArray()
            console.log(recents,'recentssss')
            resolve(recents)
        })
    },

    getMonthlyGraph:()=>{
        return new Promise(async(resolve,reject)=>{
            let monthlyGraph = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {$group:{_id:{'month':{$month:'$date'},'year':{$year:'$date'}},totalAmount:{$sum:'$totalAmount'}}},

                {$project:{_id:0,year:'$_id.year',month:'$_id.month',totalAmount:'$totalAmount'}},

                {$sort:{year:-1,month:-1}},

                {$limit:12}

               

            ]).toArray()
            console.log(monthlyGraph,'chzaarttttttt')
//-----------converting month number to month name----------------//
            monthlyGraph.forEach(element => {
                function toMonthName(month) {
                  const date = new Date();
                  date.setMonth(month - 1);
                  return date.toLocaleString('en-US', {
                    month: 'long',
                  });
                }
                element.month = toMonthName(element.month)
              });
//-----------end converting month number to month name----------------//


              console.log(monthlyGraph,'newwwwwwwwwwwwwwww')



            resolve(monthlyGraph)
        })
    },

    
    getFilteredReport:(fromDate,toDate)=>{
        console.log(fromDate,toDate,'helper')
        return new Promise(async(resolve,reject)=>{
            let filteredSalesReport = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

               

                {$unwind:'$products'},

                {$match:{date: { $gte : new Date(fromDate), $lte : new Date(toDate) } } },

                {$group:{_id:'$products.item',totalQuantity:{$sum:'$products.quantity'}}},
                
                {$lookup:{ from:'PRODUCT',localField:'_id',foreignField:'_id',as:'productName'}},
                
                {$unwind:'$productName'},
                
                {$project:{name:'$productName.product',orderQuantity:'$totalQuantity',price:'$productName.price',revenue: { $multiply: [ "$totalQuantity", "$productName.price" ] }}}
            
            ]).toArray()
            console.log(filteredSalesReport,'ggggggggggggggggggggggg')
            resolve(filteredSalesReport)
        })
    },

    getWeeklyRevenueGraph:()=>{
        return new Promise(async(resolve,reject)=>{
            let revenueWeekly = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
                {$group:{_id:{'year':{$year:'$date'},'month':{$month:'$date'},'day':{$dayOfMonth:'$date'}},revenue:{$sum:'$totalAmount'}}},
                
                {$project:{_id:0,date:'$_id.day',month:'$_id.month',year:'$_id.year',revenue:1}},
                
                {$sort:{year:-1,month:-1,date:-1}},

                {$limit:7}
            
            ]).toArray()
                
            console.log(revenueWeekly,'rev weekly')
            revenueWeekly.forEach(revenueWeekly=>{
                revenueWeekly.ddmmyy = revenueWeekly.date+'/'+revenueWeekly.month+'/'+revenueWeekly.year
            })
            

            console.log(revenueWeekly,'final')

            resolve(revenueWeekly)
        })
    },

    getWeeklyQuantity:()=>{
        return new Promise(async(resolve,reject)=>{
            let quantityweekly = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
                {$unwind:'$products'},{$group:{_id:{'year':{$year:'$date'},'month':{$month:'$date'},'day':{$dayOfMonth:'$date'}},quantity:{$sum:'$products.quantity'}}},
                
                {$project:{_id:0,date:'$_id.day',month:'$_id.month',year:'$_id.year',quantity:1}},
                
                {$sort:{year:-1,month:-1,date:-1}},
                
                {$limit:7}
            
            ]).toArray()

            console.log(quantityweekly,'quantityy')

            resolve(quantityweekly)
        })
    }

   
   
}