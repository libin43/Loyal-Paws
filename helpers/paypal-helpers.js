const paypal = require('paypal-rest-sdk')
const env = require('dotenv').config()

paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.PayPal_id,
    'client_secret': process.env.PayPal_secret
  });

  module.exports={

      createOrder : ( payment ) => {
        return new Promise( ( resolve , reject ) => {
            paypal.payment.create( payment , function( err , payment ) {
              
             if ( err ) {
                 reject(err); 
             }
            else {
                resolve(payment); 
            }
            }); 
        });
    }		
  }