var express = require('express');
const { response } = require('../app');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var categoryHelpers = require('../helpers/category-helpers')
var productHelpers = require('../helpers/product-helpers')

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
    if(response.status){
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
      console.log('Login success')
    }else{
      res.render('user/signin',{error:true})  //render email and pass not match
    }
  })

})



//Home

router.get('/', function(req, res, next) {
  if(req.session.loggedIn){
    categoryHelpers.getAllCategory().then((category_data)=>{
      productHelpers.getAllProduct().then((prod_data)=>{
        res.render('user/index',{category_data,prod_data})
      })
     
})
  }else{
    res.redirect('/signin')
  }
  
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


//Logout
router.get('/logout',(req,res)=>{
  req.session.destroy()
  console.log('Logout')
  res.redirect('/signin')
})

module.exports = router;
