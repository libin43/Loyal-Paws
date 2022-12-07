const mongoClient = require('mongodb').MongoClient
let uri = 'mongodb+srv://dbLibin:dbLibin@cluster0.pmud7ij.mongodb.net/test'
const state={
    db:null
}

module.exports.connect = function(done){
    const url = uri
    const dbname ='PawsIndia'



    mongoClient.connect(url,(err,data)=>{
        if(err){
            return done(err)
        }
        else{
            state.db = data.db(dbname)
            done()
        }
    })
}
module.exports.get = function(){
    return state.db
}