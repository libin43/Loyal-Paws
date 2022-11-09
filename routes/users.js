var express = require('express');
const { response } = require('../app');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers');
const categoryHelpers = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const otpHelpers = require('../helpers/otp-helpers');
const paypalHelpers = require('../helpers/paypal-helpers')

//VerifyLogin
const verifyLogin =(req,res,next)=>{
  if(req.session.loginStatus==true){
    next()
  }else{
    res.redirect('/signin')
  }
}

//Signup
router.get('/signup',(req,res)=>{

  res.render('user/signup',{newuser:true})
})

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    if(response.status==false){
      res.render('signup',{emailExistError:true})
    }else{
      res.redirect('/signin')
    }

  })
})

//Login
router.get('/signin',(req,res)=>{
  res.render('user/signin',{newuser:true})
})

router.post('/signin',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{

    if(response.status==false){
      res.render('user/signin',{userBlocked:true,newuser:true})
    }
    else{
      console.log(response.user,'ppppppppppppppppppppppppppppppppppppppp',response.status);
      req.session.loginStatus = response.status
      req.session.user = response.user
      console.log('Login success')
      res.redirect('/')
    }
  })
  .catch((response)=>{
    if(response.status){
      console.log(response.status)
      res.render('user/signin',{wrongPass:true,newuser:true})
    }
   else{
    console.log(response)
    res.render('user/signin',{error:true,newuser:true}) 
   }
  })
})




//Otp get
router.get('/forgot-password',(req,res)=>{

  res.render('user/forgotpassword',{newuser:true})
})



router.post('/forgot-password', (req, res) => {
  userHelpers.checkPhone(req.body).then((user) => {

    if (user.status) {
      const phoneData = `+91${req.body.phone}`
      console.log(phoneData)
      otpHelpers.sendOtp(phoneData).then((data) => {
        console.log(data)
        res.redirect('/enter-otp')
      }).catch((err) => {
        console.log(err)
      })

    }
    else {
      console.log('User Blocked')
    }


  }).catch((err) => {
    console.log(err)
    console.log('Account Doesnot Exist')

  })


})

//Otp verify
router.get('/enter-otp',(req,res)=>{
  res.render('user/enterOtp',{newuser:true})
})

router.post('/enter-otp',(req,res)=>{
  const otpData = req.body.otp
  otpHelpers.verifyOtp(otpData).then((response)=>{
    console.log(response)
    res.redirect('/')
  })
  .catch((err)=>{
    console.log(err)
  })

})


//Home

router.get('/', verifyLogin, async function(req, res, next) {
 let cartCount = null
   if(req.session.user){
     cartCount = await userHelpers.getCartCount(req.session.user._id)
   }
    let userName = req.session.user.name
    console.log(userName)
    categoryHelpers.getAllCategory().then((category_data)=>{
      productHelpers.getAllProduct().then((prod_data)=>{
        res.render('user/index',{category_data,prod_data,userName,cartCount})
      })  
})
 
});


//User Profile
router.get('/user-profile',(req,res)=>{
  res.render('user/userProfile')
})



//Dog Food
router.get('/category/',async(req,res)=>{
  let prod_cat = await productHelpers.getProductFromCategory(req.query.name)
  res.render('user/dogfood',{prod_cat})
})

//View Product
router.get('/viewproduct/',async(req,res)=>{
  let prodID = await productHelpers.getProductDetails(req.query.id)
    console.log(prodID)
    categoryHelpers.getAllCategory().then((category_data)=>{
      res.render('user/viewproduct',{prodID,category_data})
})
 
})


//Cart ,passing user and product id so that these ids are inserted or updated inside cart collection
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{   
  console.log('api called')          
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })                  
})

//Cart
router.get('/cart',verifyLogin,async(req,res)=>{
  const userID = req.session.user._id
  let userName = req.session.user.name
  let products = await userHelpers.getCart(userID)
  let total = 0

  if (products.length > 0) {
     total = await userHelpers.totalPrice(userID)
    console.log(products)
  
  }
  res.render('user/cart',{products,total,userID,userName})
})

//Change Product quantity ajax 
router.post('/change-product-quantity',(req,res)=>{
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.totalView = await userHelpers.totalPrice(req.body.user)
    res.json(response)
  })
})

//delete Product ajax
router.post('/delete-cart-product',(req,res)=>{
  console.log(req.body)
  userHelpers.deleteCartProduct(req.body).then((response)=>{
    res.json(response)
  })
})

//Checkout 


router.get('/checkout',async(req,res)=>{
  let total = await userHelpers.totalPrice(req.session.user._id)
  res.render('user/checkout',{total,useR:req.session.user})
})
//Order Address,details everything sent and new order collection created and cart deleted
//Theres also razorpay integration
router.post('/checkout',async(req,res)=>{
  console.log(req.body);
  let products = await userHelpers.getCartProductList(req.body.userID)
  let totalPrice = await userHelpers.totalPrice(req.body.userID)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderID)=>{

    if(req.body['payment-method']== 'COD'){
      res.json({codSuccess:true})
    }

//Paypal    
    else if(req.body['payment-method']== 'PAYPAL'){

      // create payment object for paypal
      var payment = {
        "intent": "authorize",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://localhost:7000/order-placed",
          "cancel_url": "http://localhost:7000/payment-failed"
        },
        "transactions": [{
          "amount": {
            "total": totalPrice,
            "currency": "USD"
          },
          "description": " a book on mean stack "
        }]
      }
      //Paypal Helper
      paypalHelpers.createOrder(payment)
      .then(( transaction )=>{
        console.log(transaction,'hello')

        let id = transaction.id;
        let links = transaction.links;
        let counter = links.length; 
        
        while( counter -- ) {
            if ( links[counter].method == 'REDIRECT') {
              transaction.pay =true
               // redirect to paypal where user approves the transaction 
              transaction.linkto = links[counter].href
             

              transaction.orderId = orderID
              transaction.paypalSuccess = true
              userHelpers.changePaymentOrderStatus(orderID).then(()=>{
                
                res.json(transaction)
              })   
                
            }
        }
      })
      .catch((err)=>{
        console.log(err);
      })
    }
//Razorpay
    else{
      userHelpers.generateRazorpay(orderID,totalPrice).then((response)=>{
        res.json(response)
      })
    }
   
  })
  console.log(req.body);
})

//


//verifyPayment            //In receipt we have order id 
router.post('/verify-payment',(req,res)=>{
  console.log('verifying');
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentOrderStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
    

  }).catch((err)=>{
    res.json({status:false})
  })
  console.log(req.body);
})


//Order Placed
router.get('/order-placed',(req,res)=>{
  res.render('user/orderplaced')
})


//view orders
router.get('/view-orders',async(req,res)=>{
  let userID = req.session.user._id
  let orderDetail=await userHelpers.getOrderDetails(userID)
  res.render('user/vieworders',{orderDetail})
})

//view order products
router.get('/view-order-products/:id',async(req,res)=>{
  let userName = req.session.user.name
  let orderProducts = await userHelpers.getOrderProductDetails(req.params.id)
  
  let commonDetail=orderProducts[0]
  commonDetail.date=commonDetail.date.toDateString()
  console.log(commonDetail)
  res.render('user/viewOrderProducts',{orderProducts,userName,commonDetail})
})
//Logout
router.get('/logout',(req,res)=>{
  req.session.destroy()
  console.log('Logout')
  res.redirect('/signin')
})

module.exports = router;
