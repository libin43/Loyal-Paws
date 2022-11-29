var express = require('express');
const { response } = require('../app');
const adminHelpers = require('../helpers/admin-helpers');
const categoryHelpers = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const chartHelpers = require('../helpers/chart-helpers');
const userHelpers = require('../helpers/user-helpers');
const couponHelpers = require('../helpers/coupon-helpers');
var router = express.Router();


const { addProduct } = require('../helpers/product-helpers');
const { Router } = require('express');
const multer = require('multer')
/************************multer  */
const multerStorageCategory = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/category-images");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })
  const uploadOne = multer({ storage: multerStorageCategory });
  const uploadSingleFile = uploadOne.fields([{ name: 'image', maxCount: 1 }])
  uploadOne
  
  /****************************** */

  const multerStorageProduct = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/product-images");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })
  const uploadMany = multer({ storage: multerStorageProduct });
//   const uploadMultiFile = uploadMany.fields([{ name: 'imageMany', maxCount: 4 }])
//   uploadMany

const emailAdmin='libinbiji43@gmail.com'
const passwordAdmin='1234'


//Login
router.get('/',function(req,res){
    res.render('admin/login',{layout:'adminlayout',adlogin:true})
})
//Admin Home
router.get('/dashboard', async(req, res)=>{
 
    if(req.session.loggedIn){

        let payments = await  chartHelpers.getPaymentGraph() 

        let sales = await chartHelpers.getTotalSales()

        let revenue = await chartHelpers.getTotalRevenue()

        let customers = await chartHelpers.getTotalUser()

        let recentSale = await chartHelpers.getRecentSale()

        let monthlygraph = await chartHelpers.getMonthlyGraph()

        let weeklyrevenue = await chartHelpers.getWeeklyRevenueGraph()

        let weeklyquantity = await chartHelpers.getWeeklyQuantity()
        

        

        res.render('admin/index',{layout:'adminlayout',admin:true, payments, sales, revenue, customers, recentSale, monthlygraph, weeklyrevenue, weeklyquantity})
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
        console.log(category_data,'hhhhhhhhhhhhhhhhhhhhhhh');
        res.render('admin/category',{layout:'adminlayout',admin:true,category_data})
})
})

//Add Category
router.get('/add-category',(req,res)=>{
    res.render('admin/addcategory',{layout:'adminlayout',admin:true})
})
router.post('/add-category',uploadSingleFile,(req,res)=>{
    console.log('kllllllllllllllllllllllllllllllllllllll')
    req.body.categoryOffer = parseInt(req.body.categoryOffer)
    req.body.image = req.files.image[0].filename
    categoryHelpers.addCategory(req.body)
      
         
  res.redirect('/admin/category')       
        
 
   
})

//Setting route to display data on edit page

router.get('/edit-category/',async(req,res)=>{
    let catID = await categoryHelpers.getCategoryDetails(req.query.id)
    console.log(catID)
    res.render('admin/editcategory',{layout:'adminlayout',admin:true,catID})

   
  })

  // click update
  router.post('/update-category/:id',uploadSingleFile,async(req,res)=>{
    console.log('dataexp',req.body);
    if(req.files.image==null){
        
        Image1 = await categoryHelpers.fetchImage(req.params.id)
        console.log(Image1,'hi')
    }
    else{
        Image1 = await req.files.image[0].filename
        console.log(Image1,'hi2')
    }
    
    req.body.image = Image1
    req.body.categoryOffer = parseInt(req.body.categoryOffer)

    categoryHelpers.updateCategory(req.params.id,req.body).then(()=>{
        console.log(req.body.categoryOffer,'thsiusssssssssssssssssssssssssssssssssssssssssssssssssss')

        productHelpers.updateCategoryModedProduct(req.body.categoryOffer,req.body.category).then(()=>{
            console.log('res in pdt helper')
            console.log('res in admin')
           
            res.redirect('/admin/category')
        })
       
        
     
        
  })

  })

//Delete Category
router.get('/delete-category/:id',(req,res)=>{
    let catID = req.params.id
    categoryHelpers.deleteCategory(catID).then((response)=>{
        res.json(response)
    })
})

//SUB CATEGORY
router.get('/subcategory',(req,res)=>{
    res.render('admin/subcategory',{layout:'adminlayout',admin:true})
})



//PRODUCT MANAGEMENT
router.get('/product',(req,res)=>{
    productHelpers.getAllProduct().then((product_data)=>{
        res.render('admin/product',{layout:'adminlayout',admin:true,product_data})
    })
})



//get category offer in product
router.post('/category-offer',async(req,res)=>{
    console.log(req.body,'coming to offer root');
    categoryHelpers.getCategoryOffer(req.body.category).then((response)=>{
        console.log(response,'offferssss')
        res.json(response)
    })
   
})










//add product
router.get('/add-product',(req,res)=>{
    categoryHelpers.getAllCategory().then((category_data)=>{
        res.render('admin/addproduct',{layout:'adminlayout',admin:true,category_data})
})

   
})

router.post('/add-product',uploadMany.array('imageMany'),(req,res)=>{
    console.log(req.files,'incoming............');
    let imageMany=[]
    req.files.forEach((value,index)=>{
        imageMany.push(value.filename)
    })
    console.log(imageMany);
    // imageMany = req.files.imageMany[0].filename
    // req.body.imageMany = imageMany
    req.body.imageMany = imageMany
    console.log(req.body.imageMany,'imageeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
    req.body.categoryOffer = parseInt(req.body.categoryOffer)
    req.body.mrp = parseInt(req.body.mrp)
    req.body.productOffer = parseInt(req.body.productOffer)
    req.body.price = parseInt(req.body.price)
    req.body.totalOffer =  req.body.categoryOffer + req.body.productOffer
    console.log(req.body,'adding prduct to db')
    productHelpers.addProduct(req.body).then((ID)=>{
        console.log(ID,'hai likku')
       
     res.redirect('/admin/product')
            
       
    })
})

//Setting route to display data on edit page

router.get('/edit-product/',async(req,res)=>{
    let prodID = await productHelpers.getProductDetails(req.query.id)
    console.log(prodID)
    categoryHelpers.getAllCategory().then((category_data)=>{
        console.log(category_data,'reqqqqqqqqqqqqqqqqqqq');
        console.log(prodID,'prodjdsfjajdfjajeo');
        res.render('admin/editproduct',{layout:'adminlayout',admin:true,prodID,category_data})
})
   
   
  })

  // click update
  router.post('/update-product/:id',uploadMany.array('imageMany'),async(req,res)=>{
    console.log(req.files,'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
    let imageMany=[]
    if(req.files.length==0){
        console.log('common if');
        
        imageMany = await productHelpers.fetchImages(req.params.id)
        console.log(imageMany)
    }
    else{
        console.log('common else');
     
    req.files.forEach((value,index)=>{
        imageMany.push(value.filename)
    })
        console.log(imageMany)
    }
    
    req.body.imageMany =  imageMany
    req.body.categoryOffer = parseInt(req.body.categoryOffer)
    req.body.mrp = parseInt(req.body.mrp)
    req.body.productOffer = parseInt(req.body.productOffer)
    req.body.totalOffer =  req.body.categoryOffer + req.body.productOffer           
    console.log(req.body,'haaai broooooooo');
    productHelpers.updateProduct(req.params.id,req.body).then(()=>{
        res.redirect('/admin/product')
        //update image
          
        
  })

  })

//Delete Product
router.get('/delete-product/:id',(req,res)=>{
    let prodID = req.params.id
    productHelpers.deleteProduct(prodID).then((response)=>{
        res.json(response)
    })
})



//update Order Status
router.post('/change-order-status',(req,res)=>{
    console.log(req.body.itemID,'dddddddddddddddddddddddddddddddddddddddddddddddddddd')
    adminHelpers.updateOrder(req.body.orderID,req.body.itemID,req.body.orderStatus).then((response)=>{
        res.json(response)
    })
})
//------------------------------------------------------------------Refund Admin Side----------------------------------------------//
router.post('/get-admin-cancel-order-detail',async(req,res)=>{
    let totalQuantity = await userHelpers.getOrderTotalQuantity(req.body.OrderID)
    console.log(totalQuantity,'total qyantitiy recieved in router')
    userHelpers.getCancelOrderDetail(req.body.OrderID,req.body.ItemID,totalQuantity).then((response)=>{
      res.json(response)
    })
    .catch(()=>{
      console.log('connection timeout')
    })
})

router.post('/payment-cancelled-wallet',(req,res)=>{
    req.body.refund = parseInt(req.body.refund)
    console.log(req.body,'infos to push to userWallet')
    userHelpers.updateCancelledInWallet(req.body.userID,req.body.product,req.body.orderID,req.body.refund,req.body.paymentMethod)
    .then((response)=>{
      res.json(response)
    })
  })
//*********************************************************************************************************************************//

//-------------------------------------------------------------------Updated Order Manage------------------------------------------//
router.get('/order-manage',async(req,res)=>{
    let orderLists = await adminHelpers.getAllOrders()
    res.render('admin/ordermanage',{layout:'adminlayout',admin:true, orderLists})
})

router.get('/order-products-manage/',async(req, res) => {
    let orderProducts = await userHelpers.getOrderProductDetails(req.query.id)
    let userDetail =orderProducts[0]
    userDetail.date=userDetail.date.toDateString()
    console.log(orderProducts,'ordeeeeeeeeeeerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
    res.render('admin/orderproducts', { layout: 'adminlayout', admin: true ,orderProducts, userDetail})
})

/*********************************************************************************************************************************//

//----------------------------------------------------------------SALES REPORT-----------------------------------------------------//

router.get('/sales-report',async(req,res)=>{
    let soldItem = await chartHelpers.getSalesReport()
    res.render('admin/sales', { layout: 'adminlayout', admin: true ,soldItem })
})

//*********************************************************************************************************************************//

//-------------------------------------------------------SALES REPORT FILTER------------------------------------------------//
router.post('/sales-date-apply',async(req,res)=>{
  

    let filteredItem = await chartHelpers.getFilteredReport(req.body.fromDate,req.body.toDate)
    let fromDate = req.body.fromDate
    let toDate = req.body.toDate
    console.log(filteredItem,'dddddddddaaaaaaaaaaaaaaaaaattttttttttttttttttttaaaaaaaaaaaaaaa');
    res.render('admin/filtersales',{ layout: 'adminlayout', admin: true ,filteredItem ,fromDate, toDate})
})
//**************************************************************************************************************************//



//--------------------------------------------------------COUPON MANAGEMENT----------------------------------------------------//
router.get('/coupon',async(req,res)=>{
    let coupons = await couponHelpers.getAllCoupon()
  
    res.render('admin/couponmanagement',{ layout: 'adminlayout', admin: true , coupons})
  })

router.get('/add-coupon',(req,res)=>{
    res.render('admin/addcoupon',{ layout: 'adminlayout', admin: true})
})

router.post('/add-coupon',(req,res)=>{
    req.body.expiry = new Date(req.body.expiry)
    req.body.minSpend = parseInt(req.body.minSpend)
    req.body.maxSpend = parseInt(req.body.maxSpend)
    req.body.couponOffer = parseInt(req.body.couponOffer)

    console.log(req.body,'k=====')
    couponHelpers.addCoupon(req.body).then((response)=>{
        console.log(response,'to check')
        res.redirect('/admin/coupon')
    })
})

router.post('/delete-coupon',(req,res)=>{
    console.log(req.body,'bum,mmmmmmmmmmm')
    couponHelpers.deleteCoupon(req.body.couponID).then((response)=>{
        res.json(response)
    })
})
//*****************************************************************************************************************************//
  


//Logout
router.get('/logout',function(req,res){
    req.session.destroy()
    res.redirect('/admin')
})

module.exports = router;
