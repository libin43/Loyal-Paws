var express = require('express');
const { response } = require('../app');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers');
const categoryHelpers = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const otpHelpers = require('../helpers/otp-helpers');
const paypalHelpers = require('../helpers/paypal-helpers');
const multer = require('multer');
const wishlistHelpers = require('../helpers/wishlist-helpers');

/************************multer  */
const multerStorageCategory = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/user-images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const uploadOne = multer({ storage: multerStorageCategory });
const uploadSingleFile = uploadOne.fields([{ name: 'image', maxCount: 1 }])
uploadOne

/****************************** */

//VerifyLogin
const verifyLogin =(req,res,next)=>{
  var url = req.url
  console.log(url)
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
      res.redirect(req.session.url)
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


//------------------------------------------H O M E--------------------------------//

router.get('/', async function(req, res, next) {
 req.session.url = req.url
 

 let userName = req.session.user?.name
 let cartCount = await userHelpers.getCartCount(req.session.user?._id)
 let category = await categoryHelpers.getAllCategory()
    console.log(userName)


    productHelpers.getAllProduct().then((prod_data) => {
      res.render('user/index', { category, prod_data, userName, cartCount })
    })

 
});

//***************************************************************************************//


//--------------------------------------USER PROFILE--------------------------------------//

router.get('/user-profile',verifyLogin,async(req,res)=>{
 
 if(req.session.user){
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  console.log(req.session.user,'looooooooooooooooooooooooooooooooooooooooo')
  let userDetails = await userHelpers.getUserDetails(req.session.user._id)
  res.render('user/userProfile',{userDetails, userName, cartCount})
 }
})


router.post('/user-profile',uploadSingleFile,async(req,res)=>{
  console.log('bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',req.body);
  if (req.files.image == null) {

    Imageuser = await userHelpers.fetchImage(req.session.user._id)
    console.log(Imageuser)
  }
  else {
    Imageuser = await req.files.image[0].filename
    console.log(Imageuser)
  }
req.body.image = Imageuser
  userHelpers.updateUserDetails(req.session.user._id,req.body).then(()=>{
    res.redirect('/user-profile')
  })
})

//*************************************************************************************//



//---------------------------------VIEW USER ADDRESS-------------------------------------//

router.get('/user-address',verifyLogin,async(req,res)=>{
  let user = req.session.user._id
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let allAddress = await userHelpers.getUserAddress(user)
  res.render('user/viewAddress',{user, allAddress, userName, cartCount})
})

//****************************************************************************************//


//---------------------------------ADD USER ADDRESS-------------------------------------//

router.get('/add-address/',verifyLogin,async(req,res)=>{
  let userID = req.query.id
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  res.render('user/addAddress',{userID, userName, cartCount})
})

router.post('/add-address/',(req,res)=>{
  let userID = req.query.id
  let userAddress = req.body
  console.log(userID,userAddress,'eeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
  userHelpers.addUserAddress(userID,userAddress).then((response)=>{
    res.redirect('/user-address')
  })
})

//*******************************************************************************************//


//-----------------------------------DELETE USER ADDRESS-------------------------------------//

router.post('/delete-address',(req,res)=>{
  console.log('haaiiiii')
  userHelpers.deleteUserAddress(req.body.addressID).then((response)=>{
    res.json(response)
  })
})

//*********************************************************************************************//


//-----------------------------------------CATEGORY---------------------------------------------//

router.get('/category/',async(req,res)=>{
  let userName = req.session.user?.name
  let cartCount = await userHelpers.getCartCount(req.session.user?._id)
  let prod_cat = await productHelpers.getProductFromCategory(req.query.name)
  categoryHelpers.getAllCategory().then((category_data) => {
    res.render('user/category',{ prod_cat, userName, cartCount, category_data})
  })

})

//**********************************************************************************************//

//-----------------------------------------------View Product------------------------------------//

router.get('/viewproduct/', async (req, res) => {
  req.session.url = req.url
  let userName = req.session.user?.name
  let cartCount = await userHelpers.getCartCount(req.session.user?._id)

  let prodID = await productHelpers.getProductDetails(req.query.id)
  let category = await categoryHelpers.getAllCategory()
  console.log(prodID, prodID._id, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')

    res.render('user/viewproduct', { prodID, category, cartCount, userName })
})

//*************************************************************************************************//

//-----------------------------------------------WISHLIST------------------------------------------//

router.get('/add-to-wishlist:id',(req,res)=>{
  console.log('adding started')
  wishlistHelpers.addToWishList(req.params.id,req.session.user._id).then((response)=>{
    console.log(response,'Wishlist added to db')
  })
})

router.get('/wishlist',verifyLogin,async(req,res)=>{
  const userID = req.session.user._id
  let userName = req.session.user.name

  let cartCount = await userHelpers.getCartCount(req.session.user._id)

  let wishProducts = await wishlistHelpers.getWishList(userID)
  
  let category = await categoryHelpers.getAllCategory()
  
  // let wishNotEmpty = false

  res.render('user/wishlist',{ userName, category, wishProducts, cartCount})
})

router.post('/add-2-cart',(req,res)=>{
  console.log(req.body,'jiiiiiiiiiiiiiii')
  userHelpers.addToCart(req.body.prodID,req.session.user._id).then(()=>{
    wishlistHelpers.deleteWishProduct(req.body).then((response)=>{
      res.json(response)
    })
  })
})


router.post('/delete-wish-product',(req,res)=>{
  console.log(req.body,'userjsssss')
  wishlistHelpers.deleteWishProduct(req.body).then((response)=>{
    res.json(response)
  }) 
})

//*************************************************************************************************//

//Cart ,passing user and product id so that these ids are inserted or updated inside cart collection
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{   
  console.log('api called')          
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })                  
})
//guest
router.get('/add-to-cart/:id',(req,res)=>{
  res.json({status:false})
})

//Cart
router.get('/cart',verifyLogin,async(req,res)=>{
  const userID = req.session.user._id
  let userName = req.session.user.name
  let products = await userHelpers.getCart(userID)
  let category = await categoryHelpers.getAllCategory()
  let total = 0
  let cartNotEmpty = false

  if (products.length > 0) {
     total = await userHelpers.totalPrice(userID)
     cartNotEmpty = true
    console.log(products)
  
  }
  
    res.render('user/cart',{products,cartNotEmpty,total,userID,userName,category})

 
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


router.get('/checkout',verifyLogin,async(req,res)=>{
  let useR = req.session.user._id
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(useR)
  let total = await userHelpers.totalPrice(req.session.user._id)
  let allAddress = await userHelpers.getUserAddress(useR)
  let category = await categoryHelpers.getAllCategory()
 
  res.render('user/checkout',{total,useR,allAddress,userName,cartCount,category})
})


//Order Address,details everything sent and new order collection created and cart deleted
//Theres also razorpay integration
router.post('/checkout',async(req,res)=>{
 
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
          "return_url": "http://localhost:7000/orderpaypal-placed",
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
              res.json(transaction)
               
                
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


//verifyPayment Razorpay           //In receipt we have order id 
router.post('/verify-payment',(req,res)=>{
  console.log('verifying');
  console.log(req.body,'lllllllllllllllllllllllllllll')
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentOrderStatus(req.body['order[receipt]'],req.session.user._id).then(()=>{
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

//Paypal Order Placed
router.get('/orderpaypal-placed',(req,res)=>{
  userHelpers.changePaymentOrderStatus(orderID,req.session.user._id).then(()=>{ 
    res.render('user/orderplaced')                         
  })
})

//Order failure
router.get('/payment-failed',(req,res)=>{
  res.render('user/orderfailed')
})
 

//view orders
router.get('/view-orders',verifyLogin,async(req,res)=>{
  let userID = req.session.user._id
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(userID)
  let orderDetail=await userHelpers.getOrderDetails(userID)
  let category = await categoryHelpers.getAllCategory()

  userHelpers.removePendingStatus().then(async()=>{ 
   console.log(orderDetail,'hitting');
  res.render('user/vieworders',{orderDetail, userName, cartCount, category})
  })
})

//view order products
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let orderProducts = await userHelpers.getOrderProductDetails(req.params.id)
  let orderId = req.params.id
  let category = await categoryHelpers.getAllCategory()

  let commonDetail=orderProducts[0]
  commonDetail.date=commonDetail.date.toDateString()
  console.log(orderProducts,'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo')
  res.render('user/viewOrderProducts',{orderProducts,orderId,userName,commonDetail,cartCount,category})
})

//Cancel orders
router.post('/cancel-order',(req,res)=>{
  console.log(req.body.orderID, req.body.itemID, req.body.cancelStatus,'hitting.............');
  userHelpers.cancelOrder(req.body.orderID,req.body.itemID,req.body.cancelStatus).then(()=>{
    res.json({status:true})
  })
})


//Selecting Address from dropdown and returning values to the input field
router.get('/selected-address/:id',(req,res)=>{
  userHelpers.getSelectedAddress(req.params.id).then((response)=>{
    console.log(response.selectedAddress,'checkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
    res.json(response.selectedAddress)
    
  })
})


//Logout
router.get('/logout',(req,res)=>{
  req.session.destroy()
  console.log('Logout')
  res.redirect('/')
})

module.exports = router;
