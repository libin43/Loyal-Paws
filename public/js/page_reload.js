
function calculate() {
    let mrp = document.getElementById('originalPrice').value
    mrp = Math.abs(mrp);
    let categoryOffer = document.getElementById('catOffer').value
    let productOffer = document.getElementById('offer').value
    if (!/^\d+$/.test(productOffer)) {
        document.getElementById('btn-add').disabled = true
        document.getElementById('offer-error').innerHTML ='Enter numbers only'
        setTimeout(function(){
            document.getElementById('offer-error').innerHTML =''
           }, 2000);
      }
      else{
        document.getElementById('btn-add').disabled = false
      }
    let totalOffer = parseInt(categoryOffer) + parseInt(productOffer)
    if(totalOffer>90){
        document.getElementById('offer-error').innerHTML ='Offer cannot be above 90%'
        setTimeout(function(){
            document.getElementById('offer-error').innerHTML =''
           }, 2000);
           document.getElementById('btn-add').disabled = true
    }
    else{
        let firstStep = (mrp / 100) * totalOffer
        let offerPrice = mrp - firstStep
        let newOfferPrice = Math.round(offerPrice)
        document.getElementById('offerPrice').value = newOfferPrice
    }
}


function addToCart(prodID){ 
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
                    icon: "warning",
                    buttons: true,
                    dangerMode: true,
                  })
                  .then((willDelete) => {
                    if (willDelete) {
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
    let finalQuantity = quantity+count
    let stock = parseInt(document.getElementById('stock'+prodId).value)
    let reminder = stock-(quantity+count)


    if(reminder<3 && reminder>=0){
            document.getElementById('stock-message'+prodId).innerHTML = 'Only '+reminder+' left in stock'
        setTimeout(function(){
            document.getElementById('stock-message'+prodId).innerHTML = ''
           }, 1000);
       
    }
    if(finalQuantity<=stock){
        if(finalQuantity < 1){
            swal({
                title: "Do you wish to delete !",
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
                            product: prodId,
                        },
                        method: 'post',
                        success: (response) => {
                            if (response.deleteProduct) {
                                location.reload()
                            }
                        }
                    })
                } else {
                  return;
                }
              });
        }
        else{
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
                        swal("Item Deleted!", "Your item removed from cart!", "success");
                        location.reload()
                    }else{
                        document.getElementById(prodId).innerHTML=quantity+count
                        document.getElementById('total').innerHTML = response.totalView
                        let productSinglePrice = parseInt(document.getElementById('productSingle'+prodId).innerHTML)
                        document.getElementById('productTotal'+prodId).innerHTML = productSinglePrice *(quantity+count)
                    }
                    
                }
            })
        }

    }
    else{
        swal({
            title: "Oops!",
            text: "Your product is currently out of stock",
            icon: "warning",
            button: "OK",
          });
    }
}

//Delete icon function-cart
function deleteProduct(cartId, prodId) {
    swal({
        title: "Are you sure?",
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
                        product: prodId,
                    },
                    method: 'post',
                    success: (response) => {
                        if (response.deleteProduct) {
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
   let selectCat = document.getElementById('selectedCat').value
   $.ajax({
    url:'/admin/category-offer',
    data:{
        category:selectCat
    },
    method:'post',
    success:(response)=>{
        if(response){
            let offer = response.categoryOffer
            document.getElementById('catOffer').value = offer
            calculate()
        }
    }
   })
  }

  function validateReferral(){
    let inputReferral = document.getElementById('refer').value
    $.ajax({
        url:'/referral',
        data:{
            enteredReferral : inputReferral,
        },
        method:'post',
        success:(response)=>{
            if(response.referralValid){
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