/* 

COMP 466 Web-Based Systems
TMA 3A

Erika Racette ID:  

This is the javascript file used for nav bar items and GET/POST requests in TMA3

*/

//Dynamically get references to all sections, links, and asides
var links;
var sections;
var asides;

document.addEventListener("DOMContentLoaded", () => {
    setupNavBar();
});

//Function to get all created links and sections
function setupNavBar() {

    links = Array.from(document.querySelectorAll('nav#nav-bar a')); //Get all links inside nav-bar
    sections = Array.from(document.querySelectorAll('main section')); //Get all sections inside main
    asides = Array.from(document.querySelectorAll('aside')); //Get all asides

    setupNavBarCompStore();

    if (links?.length && sections?.length) {
        //-- Load and setup the content within all links --
        //-- Create event listeners for all nav bar menu items
        links.forEach((link, index) => {
            //Go through each link and create an action listener
            link.addEventListener('click', () => {
                showSection(link, index); //Show associated content with the link
            });
        });
        showSection(links[0], 0); //Show the first section and select first link
        links[0].classList.add('active'); //Make the first tab the active one
    }

    //console.log("links: ", links);
    //console.log("section: ", sections);
    //console.log("asides: ", asides);

}

function setupNavBarCompStore() {
    // Add extra clickable elements to the nav functionality
    const addToCartBtn = document.getElementById('add-to-cart-btn'); //Add to cart is link-9, section-9
    const placeOrderBtn = document.getElementById('place-order-btn'); //Place order is link nav-10, section-10
    const accountIcon = document.getElementById('account-icon'); //Account is nav-11, section-11
    if (addToCartBtn) links.push(addToCartBtn);
    if (placeOrderBtn) links.push(placeOrderBtn);
    if (accountIcon) links.push(accountIcon);
}

//Function to show the selected section and hide others
//@param navLink - is the link to make active
//@param index - the index of the section to make active
function showSection(navLink, index) {

    //Remove all active links
    links.forEach(link => link.classList.remove('active')); 
    navLink.classList.add('active'); //Add the one clicked to be the active one 

    //Hide all sections first
    sections.forEach(section => section.style.display = 'none'); //Hide all content first
    sections[index].style.display = 'flex'; //Show relevant sections

    //If the sub-nav exists (part 3 & 4)
    if (typeof subNav !== 'undefined' && subNav !== null) {

        //Hide all asides
        if (asides?.length) { //If asides exist
            asides.forEach((aside) => {
                aside.style.display = 'none';
            });
        }

        //If button clicked was addToCartBtn
        if (navLink.id == 'add-to-cart-btn') { //Show cart summary
            populateCartSummary(); //Change the contents of the cart summary
            showMessage(links[9], "Update cart"); //Set 'Add to Cart' text to now 'Update Cart'
        }

        //If link clicked was place order button
        if (navLink.id == 'place-order-btn') { //Attempt to place the order
            if(!placeOrder()) { //If placing the order failed
                alert("Oops! We couldn't place your order. Please visit our store to complete your purchase.");
                return; //Skip the rest of the function
            }
            showMessage(links[9], "Add to Cart"); //Reset cart message
        }
        //Show account section
        if (navLink.id == 'account-icon') {
            getAccountOrders();
        }
        
        //Keep sub-nav items div visible if they were clicked
        if (navLink.closest('#sub-nav') || navLink.id == 'nav-1') { //If the subnav or prebuilts tab was clicked
            links[1].classList.add('active'); //Keep Prebuilds nav tab checked
            subNav.style.visibility = 'visible'; //sub-nav stays visible/expanded
            asides[0].style.display = 'flex'; //pc-customizer aside visible
            updateTotalPrice(); //Update total price on prebuilt click
        } else if (navLink.id == 'nav-8' || navLink.id == 'place-order-btn') { //If 'contact' or 'place order'(success) was clicked
            asides[1].style.display = 'flex'; //store address aside visible
            subNav.style.visibility = 'hidden';
        } else {
            subNav.style.visibility = 'hidden'; //Else, hide sub-nav if other link is clicked
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top smoothly
}

/*Function for changing text in target elements
@param targetElement - The HTML element where the message will be displayed
@param message - message to display to the user
@param color - The color of text the message will be in 
(Define in global scope so accessible from other files)*/
function showMessage(targetElement, message, color) {
    targetElement.innerHTML = message;
    targetElement.style.color = color;
}

//General create and configure XMLHttpRequest function

/*Function to handle GET requests
Uses promises to wait for the response and will resolve upon ASP data fetch
@param url - the url to the ASP file that will be loaded */
async function loadASPFileGET(url){

    //console.log("Loading: " + url);
    
    //Create and configure XMLHttpRequest
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => { //Return new promise
        xhr.open('GET', url, true);
        xhr.timeout = 10000;  //Timeout after 10 seconds

        //Handle response
        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    //Return the data from the ASP file to the original function call
                    //console.log("GET ASP: " + xhr.responseText);
                    resolve(JSON.parse(xhr.responseText)); //Resolve promise with parsed data
                    //responseData.error = true;
                } catch (e) { //try/catch error
                    console.log('Error parsing JSON:', e);
                    reject(e); //Reject promise if JSON parsing error
                }
            } else { //xhr.status other than 200
                //console.log('Request failed with status:', xhr.status);
                reject(new Error('Request failed with status ' + xhr.status)); //Reject promise on request failure
            }
        };

        xhr.onerror = () => { //Any network errors
            console.log('Network error');
            reject(new Error('Request error')); //Reject promise on network error
        };

        xhr.ontimeout = () => { //Any timeout errors
            console.log('Request timeout');
            reject(new Error('Request timeout')); //Reject request times out
        };
        
        xhr.send(); //Send GET request
    }); //Promise end
}

/*Function to handle POST requests
Uses promises to wait for the response and will resolve upon ASP data fetch
@param url - the url to the ASP file that will be loaded 
@param data - the data to use in the post*/
async function loadASPFilePOST(url, data) {
    //console.log("URL: ", url);
    //console.log('loading ASP file (POST data: ', data , ')');

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => { //Return new promise
        xhr.open('POST', url, true);
        
        if ((typeof cart !== 'undefined' && data === cart) || typeof data === 'number') { //If the data being sent is the cart OR data is a number (delete orderID)
            data = JSON.stringify(data);
            xhr.setRequestHeader('Content-Type', 'application/json');
        }

        xhr.onload = () => {
            //console.log("Load ASP: " + xhr.responseText);
            if (xhr.status === 200) {
                try {
                    //Return the data from the ASP file to the original function call
                    //console.log("Load ASP: " + xhr.responseText);
                    //return JSON.parse(xhr.responseText);
                    resolve(JSON.parse(xhr.responseText)); //Resolve promise with parsed data
                } catch (e) {
                    console.log('Error parsing JSON:', e);
                    reject(e); //Reject promise if JSON parsing error
                }
            } else {
                const response = JSON.parse(xhr.responseText);
                const errors = response.errors || {};
                let message = response.message || '';
            
                if (errors.email) {
                    message += "\n" + errors.email;
                }
                if (errors.password) {
                    message += "\n" + errors.password;
                }
            
                resolve({ success: false, message: message.trim() });
                //reject(new Error('Request failed with status ' + xhr.status)); //Reject promise on request failure
            }
        };

        xhr.onerror = () => { //Any network errors
            console.log('Network error');
            reject(new Error('Request error')); //Reject promise on network error
        };

        xhr.ontimeout = () => { //Any timeout errors
            console.log('Request timeout');
            reject(new Error('Request timeout')); //Reject request times out
        };

        xhr.send(data);  //Send POST data
    }); //Promise end
}