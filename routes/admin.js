var express = require('express');
const adminHelpers = require('../helpers/admin-helpers');
var router = express.Router();

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


//Logout
router.get('/logout',function(req,res){
    req.session.destroy()
    res.redirect('/admin')
})

module.exports = router;
