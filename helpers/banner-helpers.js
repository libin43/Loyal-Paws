var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports={
    addBanner:(bannerData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerData).then(()=>{
                resolve()
            })
        })
    },
    getAllBanner:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            .then((bannerData)=>{
                resolve(bannerData)
            })
        })
    },
    getBannerDetails:(bannerID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerID)}).then((bannerDetail)=>{
                resolve(bannerDetail)
            })
        })
    },
    updateBanner:(bannerID,inpData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne( {_id:objectId(bannerID)},
            { $set:{
                title:inpData.title,
                description:inpData.description,
                lgImage:inpData.lgImage,
                smImage:inpData.smImage,
            }}
            ).then(()=>{
                resolve()
            })
        })
    },
    fetchLargeImg:(bannerID)=>{
        return new Promise(async(resolve,reject)=>{
            let data = await db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerID)})
            console.log(data)
            resolve(data.lgImage)
        })
    },
    fetchSmallImg:(bannerID)=>{
        return new Promise(async(resolve,reject)=>{
            let data = await db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerID)})
            console.log(data)
            resolve(data.smImage)
        })
    },
    deleteBanner:(bannerID)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(bannerID)})
            .then(()=>{
                resolve({status:true})
            })
        })
    }
}