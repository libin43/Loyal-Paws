// const { response } = require("../../app");

function addToCart(prodID){
    $.ajax({
        url:'/add-to-cart/'+prodID,
        method: 'get',
        success: (response)=>{   
            if(response.status){
               let count = $('#cart-count').html()
               count = parseInt(count)+1
               $('#cart-count').html(count)
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
                alert('Product removed from cart')
                location.reload()
            }else{
                document.getElementById(prodId).innerHTML=quantity+count
                document.getElementById('total').innerHTML = response.totalView

            }
            
        }
    })
}

function deleteProduct(cartId,prodId){
    $.ajax({
        url:'/delete-cart-product',
        data:{
            cart:cartId,
            product:prodId
        },
        method: 'post',
        success:(response)=>{
            if(response.deleteProduct){
                alert('Product removed from Cart')
                location.reload()
            }
        }
    })
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


