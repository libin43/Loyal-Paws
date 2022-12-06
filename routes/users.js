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
const couponHelpers = require('../helpers/coupon-helpers');
const bannerHelpers = require('../helpers/banner-helpers');

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

let firstUser 

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
      firstUser = true
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
      console.log(firstUser,'check iin signin')
 
      if(firstUser==true){
        console.log('redirect to referal')
        res.redirect('/referral')
      }
      else{
        res.redirect(req.session.url)
      }
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


//-------------------------------REFERAL PAGE--------------------------------------//
router.get('/referral',(req,res)=>{
    
    res.render('user/referral')

})
router.post('/referral',(req,res)=>{
  let userId = req.session.user._id
  let userName = req.session.user?.name
  firstUser = false

  console.log(req.body.enteredReferral,'data from input referral')
  userHelpers.checkReferral(userId,userName,req.body.enteredReferral)
  .then((response)=>{
    console.log(response,'got in route to pass to ajax')
    res.json(response)
  })


})
//*********************************************************************************//

//-----------------------------------------W A L L E T-------------------------------------//
router.get('/user-wallet',async(req,res)=>{
  let userId = req.session.user._id
  let walletRefInfo = await userHelpers.getWallet(userId)
  let referralID = walletRefInfo.referalId
  let walletTotal = walletRefInfo.wallet
  let walletHistory = walletRefInfo.walletHistory.reverse()
  walletHistory = walletHistory.slice(0,5)
  let walletHistoryCount = walletRefInfo.walletHistory.length
  console.log(walletHistoryCount,'takenumber');
  let limit = 5
  let pages = Math.ceil(walletHistoryCount/limit)
  console.log(pages,'this is pages')
  let pageNum =[]
  for(i=1;i<=pages;i++){
     pageNum.push(i)
  }
  console.log(pageNum,'finally');
  console.log(walletHistoryCount,'wallet hist docs')
  
  res.render('user/wallet',{walletTotal,referralID,walletHistory,pageNum})
})


router.get('/user-wallet-data/',async(req,res)=>{
  let userId = req.session.user._id
  let num = req.query.num
  
  let prev =1
  if(num>1){
     prev = num-1
  }
  
  let ToLimit = 5
  let ToSkip = (num-1)*ToLimit
  let walletRefInfo = await userHelpers.getWallet(userId)
  let referralID = walletRefInfo.referalId
  let walletTotal = walletRefInfo.wallet
  let walletHistoryCount = walletRefInfo.walletHistory.length
  console.log(walletHistoryCount,'takenumber');
  let limit = 5
  let pages = Math.ceil(walletHistoryCount/limit)

  let next =pages
  if(num<pages){
     num = parseInt(num)
     next = num+1
  }

  console.log(pages,'this is pages')
  let pageNum =[]
  for(i=1;i<=pages;i++){
     pageNum.push(i)
  }
  
  let paginationWallet = await userHelpers.getFilteredWallet(ToLimit,ToSkip,userId)
  console.log(paginationWallet,'recf in route')
  console.log(num,'its pg number')
  res.render('user/walletPagination',{walletTotal,referralID,paginationWallet,pageNum,prev,next})
})
//*****************************************************************************************//



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
    console.log(response,'response in post otp')
    res.redirect('/')
  })
  .catch((err)=>{
    console.log(err)
  })

})


//------------------------------------------H O M E--------------------------------//

router.get('/', async function(req, res, next) {

 

 let userName = req.session.user?.name
 let cartCount = await userHelpers.getCartCount(req.session.user?._id)
 let wishListCount = await wishlistHelpers.getWishCount(req.session.user?._id)
 let category = await categoryHelpers.getAllCategory()
 let banner = await bannerHelpers.getAllBanner()
 console.log(category,'checkinggggggggggcat');
    console.log(userName)


    productHelpers.getAllProduct().then((prod_data) => {
      res.render('user/index', { category, prod_data, userName, cartCount ,wishListCount ,banner})
    })

 
});

//***************************************************************************************//


//--------------------------------------USER PROFILE--------------------------------------//

router.get('/user-profile',verifyLogin,async(req,res)=>{
  console.log(firstUser,'main check')
 
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

router.post('/add-address/',verifyLogin,(req,res)=>{
  let userID = req.query.id
  let userAddress = req.body
  console.log(userID,userAddress,'eeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
  userHelpers.addUserAddress(userID,userAddress).then((response)=>{
    res.redirect('/user-address')
  })
})

//*******************************************************************************************//


//-----------------------------------DELETE USER ADDRESS-------------------------------------//

router.post('/delete-address',verifyLogin,(req,res)=>{
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
    res.json({status:true})
  })
})

router.get('/wishlist',verifyLogin,async(req,res)=>{
  const userID = req.session.user._id
  let userName = req.session.user.name

  let cartCount = await userHelpers.getCartCount(req.session.user._id)

  let wishProducts = await wishlistHelpers.getWishList(userID)
  
  let category = await categoryHelpers.getAllCategory()
  


  res.render('user/wishlist',{ userName, category, wishProducts, cartCount, noWishProducts:true})
})

router.post('/add-2-cart',(req,res)=>{
  console.log(req.body,'jiiiiiiiiiiiiiii')
  userHelpers.addToCart(req.body.prodID,req.session.user._id).then(()=>{
    wishlistHelpers.deleteWishProduct(req.body).then((response)=>{
      res.json(response)
    })
  })
})


router.post('/delete-wish-product',verifyLogin,(req,res)=>{
  console.log(req.body,'userjsssss')
  wishlistHelpers.deleteWishProduct(req.body).then((response)=>{
    res.json(response)
  }) 
})

//*************************************************************************************************//



//--------------------------------------------SEARCH-----------------------------------------------//
// router.get('/search-products',(req,res)=>{
//   res.render('user/search')
// })

router.post('/search-input-products',(req,res)=>{
  console.log(req.body,'search field post data')
  userHelpers.searchProduct(req.body.search).then((products)=>{

    
    console.log(products,'fianan ress')
    res.render('user/search',{products})
    
  })
  .catch((err)=>{
   
    if(err.productNotFound){
      console.log('rendring yo not found')
      res.render('user/search',{err})
    }
  })
})


//*************************************************************************************************//


//-----------------------------------------------FILTER PRICE--------------------------------------//


router.post('/price-category',(req,res)=>{
  console.log(req.body,'coming')
  userHelpers.filterPrice(req.body.minimum,req.body.maximum).then((products)=>{
    console.log(products,'final theeeeee')
    res.render('user/pricefilter',{products,noProduct:true})
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
  let outOfStock = false

  if (products.length > 0) {
     total = await userHelpers.totalPrice(userID)

     cartNotEmpty = true
  
    console.log('start'+products,'Checking products in routes to pass into cart')
    let limit = products.length
   //if product exist in cart for longer time and stock decreased
    for(i=0;i<limit;i++){
      console.log('start',products[i].quantity,'end')
      if(products[i].quantity > products[i].stock){
        console.log('quantity greater than stock');
        products[i].quantity = products[i].stock
        let quantity = products[i].quantity
        let itemID = products[i].item
        let cartID = products[i]._id
        userHelpers.updateProductQuantity(cartID,itemID,quantity)
        
      }
      
    }
    //if products are out of stock show status and button to remove those products
    for(i=0;i<limit;i++){
      let singleProduct = products[i]
      

      if(singleProduct.stock==0){
        console.log('Here theres out of stock products');
        outOfStock = true
        break;
      }

    }

    console.log(outOfStock,'dfajhiufhjiuahiweurfhuihaquierhfglibin')
  
  }
  let length = products.length
  console.log(length)
  
    res.render('user/cart',{products,cartNotEmpty,total,userID,userName,category,outOfStock,length})

 
})

//Verify cart from proceed to checkout button
router.get('/verify-cart',async(req,res)=>{
  const userID = req.session.user._id
  let products = await userHelpers.getCart(userID)
  let limit = products.length
  let reload = false

   for(i=0;i<limit;i++){

     if(products[i].quantity > products[i].stock || products[i].stock == 0){
       reload = true
       break; 
     } 
   }
   if(reload == true){
    res.json({Reload:true})
   }
   else if(reload == false){
    res.json({noReload:true})
   }
  
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
router.post('/checkout',verifyLogin,async(req,res)=>{
  let userID = req.session.user._id
  let products = await userHelpers.getCartProductList(req.body.userID)
  
  
  // let totalPrice = await userHelpers.totalPrice(req.body.userID)
  console.log(req.body.orderTotal,'coooooooooo')
  let totalPrice = parseInt(req.body.orderTotal)
  let noCouponTotal = parseInt(req.body.subTotal)
  let discount = parseInt(req.body.discount)

  userHelpers.placeOrder(req.body,products,totalPrice,noCouponTotal,discount).then((orderID)=>{


    if(req.body['payment-method']== 'COD'){
      console.log(products,'ORDER products in cod')
      res.json({codSuccess:true,products})
    }

    else if(req.body['payment-method']=='WALLET'){
      console.log('wallet hitting')
      userHelpers.generateWalletPayment(orderID,userID).then(()=>{
        userHelpers.changePaymentOrderStatus(orderID,userID).then(()=>{
          res.json({walletSuccess:true,products})
        })
      }).catch(()=>{
        
        res.json({insufficientBalance:true})
      })
      
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
          "return_url": "http://localhost:7000/orderpaypal-placed/"+orderID,
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
      console.log('razorpay hitting');
      userHelpers.generateRazorpay(orderID,totalPrice,products).then((response)=>{
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
  console.log(req.body.products,'lllllllllllllllllllllllllllll')
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentOrderStatus(req.body['order[receipt]'],req.session.user._id).then(()=>{
      userHelpers.decreaseStock(req.body.products).then(()=>{
        res.json({stockDecrease:true})
      })
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
router.get('/orderpaypal-placed/:id',async(req,res)=>{
  let products = await userHelpers.getPaypalOrderDetail(req.params.id)
  products = JSON.stringify(products)
  userHelpers.decreaseStock(products).then(()=>{
    userHelpers.changePaymentOrderStatus(req.params.id,req.session.user._id).then(()=>{ 
      res.render('user/orderplaced')                         
    })
  })

})

//Order failure
router.get('/payment-failed',(req,res)=>{
  userHelpers.removePendingStatus().then(()=>{
    res.render('user/orderfailed')
  })

})
 

//----------------------------------------VIEW ORDERS----------------------------------//
router.get('/view-orders',verifyLogin,async(req,res)=>{
  let userID = req.session.user._id
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(userID)
  let orderdetail= await userHelpers.getOrderDetails(userID)
  let category = await categoryHelpers.getAllCategory()


  let orderTotalCount = orderdetail.length
  console.log(orderTotalCount,'total doc count')
  let limit = 5
  let pages = Math.ceil(orderTotalCount/limit)
  console.log(pages,'this is pages')
  let pageNum =[]
  for(i=1;i<=pages;i++){
     pageNum.push(i)
  }
  console.log(pageNum,'page number of view order')
  let orderDetail = orderdetail.slice(0,5)
  

  userHelpers.removePendingStatus().then(()=>{ 
   console.log(orderDetail,'hitting');
  res.render('user/vieworders',{orderDetail, userName, cartCount, category,pageNum})
  })
})

router.get('/user-order-data/',async(req,res)=>{
  let userID = req.session.user._id
  let num = req.query.num
  let ToLimit = 5
  let ToSkip = (num-1)*ToLimit
  console.log(num,'these are number of page')
  let orderdetail= await userHelpers.getOrderDetails(userID)
  let orderTotalCount = orderdetail.length
  console.log(orderTotalCount,'total doc count')
  let limit = 5
  let pages = Math.ceil(orderTotalCount/limit)
  console.log(pages,'this is pages')
  let pageNum =[]
  for(i=1;i<=pages;i++){
     pageNum.push(i)
  }
  let orderDetailLimit = await userHelpers.getOrderDetailsPagination(userID,ToLimit,ToSkip)
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(userID)
  let category = await categoryHelpers.getAllCategory()

  res.render('user/viewordersPagination',{userName,cartCount,category,orderDetailLimit,pageNum})
})
//************************************************************************************//

//view order products
router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  let userName = req.session.user.name
  let cartCount = await userHelpers.getCartCount(req.session.user._id)
  let orderProducts = await userHelpers.getOrderProductDetails(req.params.id)
  let orderId = req.params.id
  let category = await categoryHelpers.getAllCategory()
  let paymentMethod = await userHelpers.getOrderPaymentDetail(orderId)
  let commonDetail=orderProducts[0]
  commonDetail.date=commonDetail.date.toDateString()
  console.log(orderProducts,'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo')
  res.render('user/viewOrderProducts',{orderProducts,orderId,userName,commonDetail,cartCount,category,paymentMethod})
})


//Cancel orders
router.post('/cancel-order',async(req,res)=>{
  console.log(req.body.orderID, req.body.itemID, req.body.cancelStatus,'hitting.............');
  if(req.body.cancelStatus == 'Cancel Requested'){
    console.log('cancel requested hitting')
    userHelpers.cancelOrder(req.body.orderID,req.body.itemID,req.body.cancelStatus).then((response)=>{
      res.json(response)
    })
  }
  else if(req.body.cancelStatus == 'Cancelled'){
    console.log(req.body.quantity,'cancelled hitting')
    userHelpers.cancelCodOrder(req.body.orderID,req.body.itemID,req.body.cancelStatus,req.body.quantity).then((response)=>{
      res.json(response)
    })
    .catch(()=>{
      console.log('Connection Time')
    })
  }
})

//Return Orders
router.post('/return-order',async(req,res)=>{

  console.log(req.body.orderID, req.body.itemID, req.body.returnStatus,'hitting.............');
  
  userHelpers.returnOrder(req.body.orderID,req.body.itemID,req.body.returnStatus).then((response)=>{
    res.json(response)
  })
})




//Selecting Address from dropdown and returning values to the input field
router.get('/selected-address/:id',(req,res)=>{
  userHelpers.getSelectedAddress(req.params.id).then((response)=>{
    console.log(response.selectedAddress,'checkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
    res.json(response.selectedAddress)
    
  })
})

//Passing coupon data entered in coupon field to check whether there exist a database and calculate
router.post('/coupon-apply',(req,res)=>{
  console.log(req.body.couponField,'coupon from field')
  couponHelpers.existCoupon(req.body.couponField).then((response)=>{
    console.log(response)
    console.log('got it')
    res.json(response)
    
  
    
  }).catch((response)=>{
    console.log('Invalid coupon')
    res.json(response)
    console.log(response,'lool')
  })
})

//Stock Decrease
router.post('/order-stock',(req,res)=>{
  console.log(req.body.products,'pass from ajax check')
  userHelpers.decreaseStock(req.body.products).then(()=>{
    res.json({stockDecrease:true})
  })
  .catch(()=>{
    console('Connection timeout')
  })
})

//Logout
router.get('/logout',(req,res)=>{
  req.session.destroy()
  console.log('Logout')
  res.redirect('/')
})

module.exports = router;
