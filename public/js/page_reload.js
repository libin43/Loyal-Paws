const { response } = require("../../app");

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