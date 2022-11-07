



    console.log("hi")
    var options = {
    width: 250, // required
    zoomWidth: 300,
    scale: 0.7,
    offset:{
      vertical:70,
      horizontal:-200,
   
    }
    
};
new ImageZoom(document.getElementById("img-container"), options);
