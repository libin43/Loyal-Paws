var firebase = require('firebase/app');
var auth = require('firebase/auth');
const { response } = require('../app');


const firebaseConfig = {
    apiKey: "AIzaSyASngWqznLo2tnQhym_LAq9mPzxNOAO2Z0",
    authDomain: "loyal-paws.firebaseapp.com",
    projectId: "loyal-paws",
    storageBucket: "loyal-paws.appspot.com",
    messagingSenderId: "197293782530",
    appId: "1:197293782530:web:19153fb1346c08fcfc591b",
    measurementId: "G-X41MLV0XD5"
  };




  var firebaseApp = firebase.initializeApp(firebaseConfig)
  auth.getAuth(firebaseApp)
  



  

  module.exports={
    sendOtp:(numberData)=>{
        return new Promise((resolve,reject)=>{
            console.log(numberData)
            firebase.auth().signInWithPhoneNumber(aut,numberData).then((response)=>{
                resolve('sms sent')
            })
        })
    }
  }