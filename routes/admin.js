var express = require('express');
const { response } = require('../app');
const adminHelpers = require('../helpers/admin-helpers');
const categoryHelpers = require('../helpers/category-helpers')
const productHelpers = require('../helpers/product-helpers')
var router = express.Router();
var fileUpload = require('express-fileupload');
const { addProduct } = require('../helpers/product-helpers');
const { Router } = require('express');

const emailAdmin='libinbiji43@gmail.com'
const passwordAdmin='1234'


//Login
router.get('/',function(req,res){
    res.render('admin/login',{layout:'adminlayout',adlogin:true})
})
//Admin Home
router.get('/dashboard', function(req, res, next){
    if(req.session.loggedIn){
        res.render('admin/index',{layout:'adminlayout',admin:true})
    }
    else{
        res.redirect('/admin')
    }
    
});


router.post('/dashboard',function(req,res){
    const adminData={email,password}=req.body

    if(email===emailAdmin && password===passwordAdmin){
        req.session.admin = adminData
        req.session.loggedIn = true
        res.redirect('/admin/dashboard')
    }
    else{
        req.session.loggedIn = false
        res.redirect('/admin')
    }
})

//User Management
router.get('/usermanagement',function(req,res){
    if(req.session.loggedIn){
        adminHelpers.getAllUsers().then((users)=>{
            res.render('admin/usermanage',{layout:'adminlayout',admin:true,users})
        })

    }
    else{
        res.redirect('/admin')
    }
   
})
//Block
router.get('/usermanagement/block/:id',(req,res)=>{
    let userId = req.params.id
    adminHelpers.blockUser(userId)
    res.redirect('/admin/usermanagement')
})
//Unblock
router.get('/usermanagement/unblock/:id',(req,res)=>{
    let userId = req.params.id
    adminHelpers.unblockUser(userId)
    res.redirect('/admin/usermanagement')
    
    

})

//Category
router.get('/category',(req,res)=>{
    categoryHelpers.getAllCategory().then((category_data)=>{
        res.render('admin/category',{layout:'adminlayout',admin:true,category_data})
})
})

//Add Category
router.get('/add-category',(req,res)=>{
    res.render('admin/addcategory',{layout:'adminlayout',admin:true})
})
router.post('/add-category',(req,res)=>{
    console.log(req.body)
    console.log(req.files.image)
    categoryHelpers.addCategory(req.body).then((ID)=>{
        let img = req.files?.image
      
        img.mv('./public/category-images/'+ID+'.jpg',(err,done)=>{
            if(!err){
                res.redirect('/admin/category')
            }else{console.log('errorrrr')}
        })
    })
   
})

//Setting route to display data on edit page

router.get('/edit-category/',async(req,res)=>{
    let catID = await categoryHelpers.getCategoryDetails(req.query.id)
    console.log(catID)
    res.render('admin/editcategory',{layout:'adminlayout',admin:true,catID})

   
  })

  // click update
  router.post('/update-category/:id',(req,res)=>{
    categoryHelpers.updateCategory(req.params.id,req.body).then(()=>{
        res.redirect('/admin/category')
        //update image
        let ID = req.params.id
        if(req.files?.image){
            let img = req.files?.image
      
            img.mv('./public/category-images/'+ID+'.jpg')
        }     
        
  })

  })

//Delete Category
router.get('/delete-category/:id',(req,res)=>{
    let catID = req.params.id
    categoryHelpers.deleteCategory(catID).then((response)=>{
        res.redirect('/admin/category')
    })
})

//SUB CATEGORY
router.get('/subcategory',(req,res)=>{
    res.render('admin/subcategory',{layout:'adminlayout',admin:true})
})



//PRODUCT MANAGEMENT
router.get('/product',(req,res)=>{
    productHelpers.getAllProduct().then((product_data)=>[
        res.render('admin/product',{layout:'adminlayout',admin:true,product_data})
    ])
})

//add product
router.get('/add-product',(req,res)=>{
    categoryHelpers.getAllCategory().then((category_data)=>{
        res.render('admin/addproduct',{layout:'adminlayout',admin:true,category_data})
})

   
})

router.post('/add-product',(req,res)=>{
    console.log(req.body)
    console.log(req.files.image)
    productHelpers.addProduct(req.body).then((ID)=>{
        let img = req.files?.image
      
        img.mv('./public/product-images/'+ID+'.jpg',(err,done)=>{
            if(!err){
                res.redirect('/admin/product')
            }else{console.log('errorrrr')}
        })
    })
})

//Setting route to display data on edit page

router.get('/edit-product/',async(req,res)=>{
    let prodID = await productHelpers.getProductDetails(req.query.id)
    console.log(prodID)
    categoryHelpers.getAllCategory().then((category_data)=>{
        res.render('admin/editproduct',{layout:'adminlayout',admin:true,prodID,category_data})
})
   
   
  })

  // click update
  router.post('/update-product/:id',(req,res)=>{
    productHelpers.updateProduct(req.params.id,req.body).then(()=>{
        res.redirect('/admin/product')
        //update image
        let ID = req.params.id
        if(req.files?.image){
            let img = req.files?.image
      
            img.mv('./public/product-images/'+ID+'.jpg')
        }     
        
  })

  })

//Delete Product
router.get('/delete-product/:id',(req,res)=>{
    let prodID = req.params.id
    productHelpers.deleteProduct(prodID).then((response)=>{
        res.redirect('/admin/product')
    })
})

//Logout
router.get('/logout',function(req,res){
    req.session.destroy()
    res.redirect('/admin')
})

module.exports = router;
