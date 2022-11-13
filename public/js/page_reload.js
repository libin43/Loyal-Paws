// const { response } = require("../../app");

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

            }
            
        }
    })
}

//Delete icon function
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

//function for updating order status
function changeOrderStatus(orderId){
    let fieldMain =document.getElementById(orderId)
    let subSelection = fieldMain.options[fieldMain.selectedIndex].text
    console.log(subSelection,'heeey youuuuuuuuuuu');
    $.ajax({
        url:'/admin/change-order-status',
        data:{
            orderID : orderId,
            orderStatus : subSelection
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                alert('Order Status Updated')
                location.reload()
            }
        }
    })
}

