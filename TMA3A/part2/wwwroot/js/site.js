/* 

COMP 466 Advanced Technologies for Web-Based Systems
TMA 3A

Erika Racette ID:  

This is the javascript file used for part2, recycled from TMA1

Tutorials used: 

Using images -
https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
https://www.w3schools.com/tags/canvas_clearrect.asp 

Transformations -
https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations

Animations -
https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations

*/
document.addEventListener("DOMContentLoaded", function() {

    //Define constants for the divs
    const prevButton = document.getElementById('prevButton'); //Previous button
    const canvas = document.getElementById('slideshowCanvas'); //The image canvas
    const nextButton = document.getElementById('nextButton'); //Next button
    const captionElement = document.getElementById('caption'); //The associated images caption

    const transitionEffectSelection = document.getElementById('transitionEffectSelection'); //Dropdown menu for the transition effect
    const sequentialOrderSelection = document.getElementById('sequentialOrderSelection'); //Dropdown menu for the order
    const startStopButton = document.getElementById('startStopButton'); //The start/stop button for the slideshow

    const context = canvas.getContext('2d'); //Rendering context of the canvas

    const imageArray = images; //imageArray now comes from the server-side data passed into JavaScript
    //console.log("imageArray: ", imageArray);
    /* All image URLs and descriptions are now in 'part2/wwwroot/images'.
    //Create an array of all of the images inside of the image folder
    //And add a caption for each of the images
    const imageArray = [
        { source: 'images/image-1.jpg', caption: "1. Remote Women's Village in Namibia" },
        { source: 'images/image-2.jpg', caption: "2. A meerkat-looking creature" },
        { source: 'images/image-3.jpg', caption: "3. Giraffes silhouetted against a sunset sky" },
        { source: 'images/image-4.jpg', caption: "4. Zebras in Etosha National Park" },
        { source: 'images/image-5.jpg', caption: "5. Elephants in a playful wrestling match, viewed through binoculars" },
        { source: 'images/image-6.jpg', caption: "6. Stunning sunset over the Namibian desert" },
        { source: 'images/image-7.jpg', caption: "7. Welcome sign at Solitaire, Namibia" },
        { source: 'images/image-8.jpg', caption: "8. A petrified tree in Deadvlei" },
        { source: 'images/image-9.jpg', caption: "9. A small creature peeking out from behind rocks" },
        { source: 'images/image-10.jpg', caption: "10. Scenic view of Norotshama River Resort" },
        { source: 'images/image-11.jpg', caption: "11. Beautiful sunset over the Orange River" },
        { source: 'images/image-12.jpg', caption: "12. Black Girdled Lizard spotted at Cape Agulhas" },
        { source: 'images/image-13.jpg', caption: "13. An African Penguin at Penguin Rock" },
        { source: 'images/image-14.jpg', caption: "14. Two Sand Tiger Sharks in the Atlantic Ocean" },
        { source: 'images/image-15.jpg', caption: "15. Seagulls flying alongside submerged Humpback Whales" },
        { source: 'images/image-16.jpg', caption: "16. A colony of Cape Gannets" },
        { source: 'images/image-17.jpg', caption: "17. Morning mist at the top of Dune 45, Sossusvlei" },
        { source: 'images/image-18.jpg', caption: "18. The South African flag flying at Robben Island" },
        { source: 'images/image-19.jpg', caption: "19. Rocks arranged in a circle at Fish River Canyon" },
        { source: 'images/image-20.jpg', caption: "20. View of Cape Town from the top of Table Mountain" }
    ]; //20 images, indexes 0-19
    */

    //General variables for the slideshow
    var currentImageIndex = 0; //Create a variable for what index picture the user is viewing

    var isSlideshowRunning = false; //Slideshow is not running when page is loaded
    var isImageTransitioning = false; //The image is not transitioning when loaded (animation playing when images are being changed)
    
    var slideshowInterval; //Interval timer for the slideshow when started

    //Create action listeners for all of the buttons
    prevButton.addEventListener('click', () => {

        if(isImageTransitioning == false) { //Check if a transition animation is running (Images will flicker if next/prev buttons are spammed)
            isImageTransitioning = true; //The image is now being generated
            changeImage(-1); //Backward (negative)
        }

    }); //Go to the prev image    

    nextButton.addEventListener('click', () => {

        if(isImageTransitioning == false) { //If the slideshow is NOT transitioning
            isImageTransitioning = true; //The image is now being generated
            changeImage(1); //Forward (positive)
        }
        
    }); //Go to the next image

    startStopButton.addEventListener('click', () => { //Start or stop the slideshow
        startStopSlideshow();
    }); 

    //Action listener for the Order dropdown, so that the forward and backward buttons are hidden when selected
    sequentialOrderSelection.addEventListener('change', () => {
    
        //If random mode is selected
        if (sequentialOrderSelection.value === 'random') {
            prevButton.style.display = 'none'; //Hide them
            nextButton.style.display = 'none';
        } else { //Else, sequential mode
            prevButton.style.display = 'inline-block'; //Add them back
            nextButton.style.display = 'inline-block';
        }
    });

    drawImage(); //Draw the initial image

    //----------Define all of the functions--------

    //Draw image
    function drawImage() {

        //console.log("drawImage called");

        const img = new Image(); //Create a new image element

        //console.log("imageArray[currentImageIndex].source: " + imageArray[currentImageIndex]);
        //console.log("imageArray[currentImageIndex] Size: " + imageArray.length);
        
        img.src = imageArray[currentImageIndex].source; //Source of images are the 'source' of each image

            img.onload = () => { //Once the images are loaded, execute switch statement

                //console.log("Transition chosen: " + transitionEffectSelection.value);

                switch (transitionEffectSelection.value) { //Depending on the value of transitionEffectSelection (dropdown menu selection)
                    case "fade":
                        fadeTransition(img); //Use the newly created image element as the parameter
                        break;

                    case "slide":
                        slideTransition(img);
                        break;

                    case "zoom":
                        zoomTransition(img);
                        break;

                    default: //Default behaviour
                        context.clearRect(0, 0, canvas.width, canvas.height); //Clear a rectangle of the canvas width/height
                        context.drawImage(img, 0, 0, canvas.width, canvas.height); //Draw the image with the canvas width+height
                
                }
            };

        captionElement.innerText = imageArray[currentImageIndex].caption; //Make the innerText of the caption the associated image's caption
        
    }

    /* Change image when next/prev buttons are pressed
        @param {number} increment - The amount to adjust the current image index.
        Use 1 to move to the next image, or -1 to move to the previous image.
    */
    function changeImage(increment) {

        //console.log("changeImage called");
        //console.log("Increment: " + increment);
        //console.log("Current image index: " + currentImageIndex);

        //Check if the user selected 'random' from the dropdown menu (Buttons are now hidden when on random)
        if (sequentialOrderSelection.value == 'random') {

        //Randomly select an image index
        currentImageIndex = Math.floor(Math.random() * imageArray.length); //Randomize the index and max out at the imageArray length
        //console.log("Using random image");

        } else {

            //console.log("Going to next/previous image in order");

            //Increment/decrement the currentImageIndex (increment can be +1 or -1)
            currentImageIndex += increment;

            //console.log("Current image index: " + currentImageIndex);

            //If the image index is bigger than the array, reset it back to 0
            if(currentImageIndex > imageArray.length-1) {
                //console.log("Image index is BIGGER than how many images there are. Resetting...");
                currentImageIndex = 0;

            } else if (currentImageIndex < 0) {  //Or if the index is negative, reset it back to the max array length
                //console.log("Image index is LESS than how many images there are. Resetting...");
                //console.log("Array length: " + imageArray.length);
                currentImageIndex = imageArray.length-1; //Wrap back to the length (-1 for indexes)
            }
        }
        drawImage();
    }

    //----Individual transition effect animations----

    //@param {HTMLImageElement} img - The image element to draw on the canvas
    function fadeTransition(img) {

        //console.log("fadeTransition called");

        let alpha = 0; //Store opacity value
        context.globalAlpha = 0; //Set global alpha to 0 (Between 0.0 (fully transparent) and 1.0 (fully opaque))

        const fadeIn = setInterval(() => {
            //console.log("Alpha value: " + alpha);
            if (alpha >= 1) { //Once the alpha value (opacity) is 1, stop the interval
                clearInterval(fadeIn);
                isImageTransitioning = false; //When switch is over, the animation is complete. Set to false
            } else { 
                context.clearRect(0, 0, canvas.width, canvas.height); //Get rid of the previous image
                
                context.globalAlpha = alpha;
                context.drawImage(img, 0, 0, canvas.width, canvas.height); //Draw the new image in the animation

                alpha += 0.05; //Increment the opacity by 0.05
            }

        }, 50); //Repeat this every 50 milliseconds until full opaque image drawn
    }

    //@param {HTMLImageElement} img - The image element to draw on the canvas
    function slideTransition(img) {

        //console.log("slideTransition called");

        let xPlacement = canvas.width; //placement of the image will be at the end of the width of it (last place of x)
 
        const slideIn = setInterval(() => {
            //console.log("X value: " + xPlacement);
            if (xPlacement < 0) { //When the canvas width is less than 0
                clearInterval(slideIn); //Stop the interval from running, the image is placed where it needs to be
                isImageTransitioning = false; //When siwtch is over, the animation is complete. Set to false
            } else { 
                context.clearRect(0, 0, canvas.width, canvas.height); //Get rid of the previous image

                context.drawImage(img, xPlacement, 0, canvas.width, canvas.height); //Draw the new image in the new x place
                xPlacement -= 20; //Decriment the x placement by 20 pixels
            }

        }, 20); //Repeat this every 20 milliseconds until image is properly centered
    }

    //@param {HTMLImageElement} img - The image element to draw on the canvas
    function zoomTransition(img) {

        //console.log("zoomTransition called");

        let scale = 0.1; //Initialize the scale size of the image to be small

        const zoomIn = setInterval(() => {
            //console.log("Scale value: " + scale);

            //Calculate what the cnter of the image canvas is
            //The center is the (widthORheight - widthORscale*scale) area
            let newX = canvas.width * scale; //New x is the new x placement since the scale
            let newY = canvas.height * scale; //New y is the new y placement since the scale
            let xCenter = (canvas.width - (newX)) / 2;
            let yCenter = (canvas.height - (newY)) / 2;

            if (scale >= 1) { //Once the scale is fully 1 (canvas size)
                clearInterval(zoomIn); //Stop the interval from running, the image is sized as big as it needs to be
                isImageTransitioning = false; //When siwtch is over, the animation is complete. Set to false
            } else { 

                context.clearRect(0, 0, canvas.width, canvas.height); //Get rid of the previous image

                context.drawImage(img, xCenter, yCenter, newX, newY); //Draw the new image with the width+height * the scale
                scale += 0.05; //Increment the scale to be a bigger image next iteration
            }

        }, 50); //Repeat this every 50 milliseconds until image is fully sized
    }

    //Start/stop the slideshow
    function startStopSlideshow() {

        //console.log("startStopSlideshow called");

        //If the slideshow is not running
        if (!isSlideshowRunning) {

            //console.log("Slideshow not running, now started");

            isSlideshowRunning = true; //It is now running

            slideshowInterval = setInterval(() => {  //Start an interval of repeating changeImage(1)
                
                changeImage(1);

            }, 5000); //Change image every 5 seconds
            
            startStopButton.innerText = '■ Stop'; //Change the inner text of the button to stop
            startStopButton.style.backgroundColor = '#92ddea'; //New background color to indicate it's running

        } else { //Else, the slideshow was already running when clicked

            //console.log("Slideshow running, now stopped");

            isSlideshowRunning = false; //It is not running anymore

            clearInterval(slideshowInterval);

            startStopButton.innerText = '► Start'; //Reset the text back
            startStopButton.style.backgroundColor = '#277987'; //Reset the background color back
        }
    }
});
