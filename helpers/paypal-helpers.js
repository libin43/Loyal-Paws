const paypal = require('paypal-rest-sdk')

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AfmkHLTfLs4YUvwHsWcQIHBe0598Op6hx6QHAzmhwizWOcyuIX-_bLy-fkJJDDpHDbiM4gMhK9FsLUQf',
    'client_secret': 'EP2wvu37UCA4PNGdX3JQ3WE6AcRzxNxEcIvL-66R6lBWcWFTgDPy3QxaG_45nWmJHdNlI8o3gGYhgpHl'
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