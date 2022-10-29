var options1 = {
    width: 400,
    zoomWidth: 1500,
    offset: {vertical: 10, horizontal: 0}
};

// If the width and height of the image are not known or to adjust the image to the container of it
var options2 = {
    width: 400,
    zoomWidth: 1400,
    zoomPosition:"original",
    
    offset: {vertical: 0, horizontal: 10}
};

new ImageZoom(document.getElementById("img-container"), options2);