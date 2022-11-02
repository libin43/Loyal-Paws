var express = require('express');
const { response } = require('../app');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const productHelpers = require('../helpers/product-helpers');
const otpHelpers = require('../helpers/otp-helpers');

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

  res.render('user/forgotpassword')
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
  res.render('user/enterOtp')
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



//Dog Food
router.get('/dog-food',function(req,res,next){
  res.render('user/dogfood')
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
  console.log(products)
  res.render('user/cart',{products,userName})
})


//Logout
router.get('/logout',(req,res)=>{
  req.session.destroy()
  console.log('Logout')
  res.redirect('/signin')
})

module.exports = router;
