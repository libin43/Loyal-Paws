// const { response } = require("../../app");

function calculate() {
    var mrp = document.getElementById('originalPrice').value
    var categoryOffer = document.getElementById('catOffer').value
    // console.log(mrp, 'orggggggggggg')
    var productOffer = document.getElementById('offer').value
    var totalOffer = parseInt(categoryOffer) + parseInt(productOffer)
    // console.log(totalOffer, 'offfffffffffffff')
    var firstStep = (mrp / 100) * totalOffer
    var offerPrice = mrp - firstStep
    var newOfferPrice = Math.round(offerPrice)
    // console.log(newOfferPrice, 'resssssssssssss')
    document.getElementById('offerPrice').value = newOfferPrice
}




function addToCart(prodID){
    
    console.log('jddddddddddddddd')
    $.ajax({
        url:'/add-to-cart/'+prodID,
        method: 'get',
        success: (response)=>{   
            if(response.status){
                swal("Item Added To Cart!", "Your Item has been added!", "success");
               let count = $('#cart-count').html()
               count = parseInt(count)+1
               $('#cart-count').html(count)
            }
            else{
                swal({
                    title: "Login To Continue !",
                    // text: "Once deleted, you will not be able to recover this imaginary file!",
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                  })
                  .then((willDelete) => {
                    if (willDelete) {
                    //   swal("Poof! Your imaginary file has been deleted!", {
                    //     icon: "success",
                    //   });
                      location.href = '/signin'
                    } else {
                      swal("Login Required !");
                    }
                  });
              
            }
            
        }
    })
}

function changeQuantity(cartId,prodId,userId,count){
    let quantity = parseInt(document.getElementById(prodId).innerHTML)
    count = parseInt(count)
    console.log(count,'fashfhisfdu');
    $.ajax({
        url:'/change-product-quantity',
        data:{
            user:userId,
            cart:cartId,
            product:prodId,
            count:count,
            quantity:quantity
        },
        method: 'post',
        success:(response)=>{
            if(response.removeProduct){
                // alert('Product removed from cart')
                // location.reload()
                swal("Item Deleted!", "Your item removed from cart!", "success");
                location.reload()
            }else{
                document.getElementById(prodId).innerHTML=quantity+count
                document.getElementById('total').innerHTML = response.totalView
                let productSinglePrice = parseInt(document.getElementById('productSingle'+prodId).innerHTML)
                // let productTotalPrice = parseInt(document.getElementById('product-price-total').innerHTML)
                document.getElementById('productTotal'+prodId).innerHTML = productSinglePrice *(quantity+count)
                

            }
            
        }
    })
}

//Delete icon function-cart
function deleteProduct(cartId, prodId) {

    swal({
        title: "Are you sure?",
        // text: "Once deleted, you will not be able to recover this imaginary file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                swal("Your item has been deleted!", {
                    icon: "success",
                });

                $.ajax({


                    url: '/delete-cart-product',
                    data: {
                        cart: cartId,
                        product: prodId
                    },
                    method: 'post',
                    success: (response) => {
                        if (response.deleteProduct) {
                            // swal("Item Deleted!", "Your item removed from cart!", "success");
                            // alert('Product removed from Cart')
                            location.reload()

                        }
                    }
                })


            } else {
                //   swal("Your imaginary file is safe!");
            }
        });

}



function deleteWishProduct(wishId, prodId) {
    swal({
        title: "Are you sure?",
        // text: "Once deleted, you will not be able to recover this imaginary file!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                swal("Your item has been deleted!", {
                    icon: "success",
                });

                $.ajax({
                    url: '/delete-wish-product',
                    data: {
                        wishID: wishId,
                        prodID: prodId,
                    },
                    method: 'post',
                    success: (response) => {
                        if (response.deleteWishProduct) {
                            location.reload()
                        }
                    }
                })
            } else {
                //   swal("Your imaginary file is safe!");
            }
        });
}


function add2Cart(prodId,wishId){
    console.log(prodId,'its pdt')
    $.ajax({
        url:'/add-2-cart',
        data:{
            prodID : prodId,
            wishID : wishId
        },
        method:'post',
        success:(response)=>{
            if(response.deleteWishProduct){
                swal({
                    title: "Added to Wishlist!",
                    icon: "success",
                    button: "OK",
                });
                location.reload()
            }
        }
    })
}



function selected(){
   
    console.log('calcujr');
    let selectCat = document.getElementById('selectedCat').value
   console.log(selectCat,'dhaskdfyhjasdfb')
   $.ajax({
    url:'/admin/category-offer',
    data:{
        category:selectCat
    },
    method:'post',
    success:(response)=>{
        if(response){
            console.log(response,'hitiing');
            let offer = response.categoryOffer
            console.log(offer,'fina;;;;;')
            document.getElementById('catOffer').value = offer
            calculate()
        }
        
    }
   })
  }

  function validateReferral(){
    console.log('validation called')
    let inputReferral = document.getElementById('refer').value
    console.log(inputReferral,'input Referral')
    $.ajax({
        url:'/referral',
        data:{
            enteredReferral : inputReferral
        },
        method:'post',
        success:(response)=>{
            if(response.referralValid){
                console.log(response,'checking to give in swal')
                swal({
                    title: "Success",
                    text: "Rs."+response.showAmount+' has been credited to your wallet!',
                    icon: "success",
                    button: "OK",
                  });
                  setTimeout(function(){
                    document.getElementById('apply').style.display = 'none'
                    document.getElementById('skip').style.display = 'none'
                    document.getElementById('ok').style.display = 'block'
                   
                   }, 2000);
                   
                  
            }
        }
    })
  }