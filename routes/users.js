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
const { getSignup, postSignup, getLogin, postLogin, getReferral, postReferral, getWalletPage, getWalletDataPage, getOtpPage, postOtpPage, verifyOtpPage, postVerifyOtpPage, getHomePage, getUserProfilePage, postUserProfilePage, getUserAddressPage, getAddUserAddressPage, postAddUserAddressPage, getDeleteUserAddress, getCategoryPage, getViewProductPage, addToWishPopUp, getWishListPage, getWishAddToCart, deleteWishFromPage, getSearchResult, getFilterResult, addToCartByUser, addToCartByGuest, getCartPage, verifyCartBtn, changeQuantityBtn, deleteCartProductBtn, getCheckoutPage, postCheckoutPage, postVerifyRazorPay, getOrderPlacedPage, getPayPalSuccessPage, getOrderFailedPage, getViewOrderPage, getViewOrdersPage, getViewOrdersPagination, getViewOrderProductsPage, getCancelOrderBtnPage, getReturnOrderBtnPage, getAddressFromDrpDwn, postCouponApply, postStockDecrease, getLogoutPage, } = require('../controllers/user-controller');
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

//----------------------SIGN UP--------------------//

router.get('/signup',getSignup)

router.post('/signup',postSignup)


//------------------------LOGIN--------------------//

router.get('/signin',getLogin)

router.post('/signin',postLogin)


//-------------------REFERAL PAGE---------------------//

router.get('/referral',getReferral)

router.post('/referral',postReferral)


//--------------------W A L L E T-------------------//

router.get('/user-wallet',verifyLogin,getWalletPage)

router.get('/user-wallet-data/',verifyLogin,getWalletDataPage)


//-------------------ONE TIME PASSWORD------------------//

router.get('/forgot-password',getOtpPage)

router.post('/forgot-password',postOtpPage)

//Otp verify
router.get('/enter-otp',verifyOtpPage)

router.post('/enter-otp',postVerifyOtpPage)


//------------------------H O M E----------------------//

router.get('/',getHomePage);


//--------------------------USER PROFILE------------------------//

router.get('/user-profile',verifyLogin,getUserProfilePage)

router.post('/user-profile',verifyLogin,uploadSingleFile,postUserProfilePage)


//-----------------------VIEW USER ADDRESS-------------------------//

router.get('/user-address',verifyLogin,getUserAddressPage)


//------------------------ADD USER ADDRESS-------------------------//

router.get('/add-address/',verifyLogin,getAddUserAddressPage)

router.post('/add-address/',verifyLogin,postAddUserAddressPage)


//--------------------DELETE USER ADDRESS-----------------------//

router.post('/delete-address',verifyLogin,getDeleteUserAddress)


//-----------------------CATEGORY----------------------------//

router.get('/category/',getCategoryPage)


//--------------------VIEW PRODUCT------------------//

router.get('/viewproduct/',getViewProductPage)


//---------------------WISHLIST-----------------------//

router.get('/add-to-wishlist:id',addToWishPopUp)

router.get('/wishlist',verifyLogin,getWishListPage)

router.post('/add-2-cart',verifyLogin,getWishAddToCart)

router.post('/delete-wish-product',verifyLogin,deleteWishFromPage)


//----------------------SEARCH-----------------------//

router.post('/search-input-products',getSearchResult)


//--------------------FILTER PRICE-------------------//

router.post('/price-category',getFilterResult)


//-------------------ADD TO CART BUTTON-------------------//
//user
router.get('/add-to-cart/:id',verifyLogin,addToCartByUser)
//guest
router.get('/add-to-cart/:id',addToCartByGuest)


//-----------------------CART------------------------//

router.get('/cart',verifyLogin,getCartPage)

//verify cart from proceed to checkout button
router.get('/verify-cart',verifyLogin,verifyCartBtn)

//change product quantity
router.post('/change-product-quantity',verifyLogin,changeQuantityBtn)

//delete product
router.post('/delete-cart-product',verifyLogin,deleteCartProductBtn)


//-------------------------CHECKOUT----------------------//

router.get('/checkout',verifyLogin,getCheckoutPage)

router.post('/checkout',verifyLogin,postCheckoutPage)

//verifyPayment razorpay  ...  in receipt we have order id 
router.post('/verify-payment',verifyLogin,postVerifyRazorPay)


//--------------------ORDER SHOW STATUS PAGE--------------------//

router.get('/order-placed',verifyLogin,getOrderPlacedPage)

//paypalordersuccess
router.get('/orderpaypal-placed/:id',verifyLogin,getPayPalSuccessPage)

//Order failure
router.get('/payment-failed',verifyLogin,getOrderFailedPage)
 

//--------------------------VIEW ORDERS----------------------//

router.get('/view-orders',verifyLogin,getViewOrdersPage)

router.get('/user-order-data/',verifyLogin,getViewOrdersPagination)


//------------------------VIEW ORDER PRODUCTS----------------------//

router.get('/view-order-products/:id',verifyLogin,getViewOrderProductsPage)

//cancel order
router.post('/cancel-order',verifyLogin,getCancelOrderBtnPage)

//return order
router.post('/return-order',verifyLogin,getReturnOrderBtnPage)


//----------------------SELECTING ADDRESS FROM DROPDOWN-------------------//

router.get('/selected-address/:id',getAddressFromDrpDwn)


//----------------------------COUPON APPLY---------------------------//

router.post('/coupon-apply',postCouponApply)


//----------------------------STOCK DECREASE------------------------//

router.post('/order-stock',postStockDecrease)


//----------------------------LOGOUT-------------------------//

router.get('/logout',getLogoutPage)

module.exports = router;
