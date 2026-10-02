/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This is the javascript file used for nav bar items in TMA2

*/

//Dynamically get references to all sections, links, and buttons
document.addEventListener("DOMContentLoaded", function () {
    setupNavBar();
});
//-----------------------part 2 additions-----------------------

//Store links and sections for the main nav
var links = [];
var sections = [];

//unit navigation
var unitLinks = [];
var unitDivs = [];

//admin sub-nav options
var adminLinks = [];

//Get persistent DOM elements
const unitQuizDiv = document.getElementById('unit-quiz-div'); //Unit quiz div container
const uploadXML = document.getElementById('upload-form'); //Upload XML form
const dropDown = document.getElementById('drop-down-form'); //Replace/Delete dropdown form
const uploadUnitBtn = document.getElementById('button-1'); //Button to upload unit
const replaceUnitBtn = document.getElementById('button-2'); //Button to replace unit
const message = document.getElementById('message'); //Global message element
const subNav = document.getElementById('sub-nav'); //Sub-navigation container
const unitContentDiv = document.getElementById('unit-content-div'); //Div where unit content is placed

//Function to setup the main nav bar and content areas
function setupNavBar() {
    links = Array.from(document.querySelectorAll('#nav-bar > a')); //Get all links inside nav-bar that are direct children
    sections = Array.from(document.querySelectorAll('main section')); //Get all sections inside main
    adminForms = Array.from(document.querySelectorAll('form')); //Get all form elements used by admin

    if (links.length && sections.length) {
        //-- Create event listeners for each nav link
        links.forEach((link, index) => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); //Stop window scroll jumping
                showSection(link, index); //Display associated section
            });
        });

        showSection(links[0], 0); //Set first section visible
        links[0].classList.add('active');
    }
}

//Function to display selected main section and hide others
//@param navLink - the clicked link
//@param index - the index of the section to show
function showSection(navLink, index) {
    if (subNav && navLink == links[1]) subNav.style.display = "block";

    unitLinks.forEach(link => link.classList.remove('active'));
    links.forEach(link => link.classList.remove('active'));
    navLink.classList.add('active');

    sections.forEach(section => section.style.display = 'none');
    if (sections[index]) sections[index].style.display = 'flex';

    if (unitDivs.length) {
        unitDivs.forEach(div => div.style.display = 'none');
        unitQuizDiv.style.display = "none";
    }

    hideAdminOptions(); //Reset admin UI visibility
}

//Re-make all unit links and content divs
function setupNavBarUnits() {
    unitLinks = Array.from(document.querySelectorAll('#unit-links > a')); //Get all dynamically created unit links
    unitDivs = Array.from(document.querySelectorAll('#unit-content-div > div')); //Get all unit content divs

    //-- Create event listeners for each unit link
    unitLinks.forEach((subNavLink, index) => {
        subNavLink.addEventListener('click', (event) => {
            event.preventDefault(); //Stop window scroll jumping
            hideAdminOptions(); //Hide admin options
            unitQuizDiv.style.display = "none"; //Hide quiz
            showUnit(subNavLink, index); //Show selected unit content
            showMessage(message, ""); //Clear message
        });
    });

    hideUnits();

    if (unitLinks.length && adminLinks.length == 0) {
        unitLinks[0].classList.add('active'); //Highlight first unit
        showUnit(unitLinks[0], 0); //Show first unit content
    }
}

/*Function to show specific unit content section
@param subNavLink - the clicked unit tab
@param index - the index of the content to show */
function showUnit(subNavLink, index) {
    if (subNav) subNav.style.display = "none"; //Hide admin sub-nav during unit viewing

    links.forEach(link => link.classList.remove('active')); 
    sections.forEach(section => section.style.display = 'none');
    unitLinks.forEach(link => link.classList.remove('active'));
    unitDivs.forEach(div => div.style.display = 'none'); 

    subNavLink.classList.add('active');
    if (unitDivs[index]) {
        unitDivs[index].style.display = 'block'; //Show relevant unit content
        
        //Show quiz button again when unit is opened
        const quizButton = unitDivs[index].querySelector('.quiz-button');
        if (quizButton) quizButton.style.display = "block";
    }

    //window.scrollTo({ top: 0, behavior: 'smooth' }); //Scroll to top
}

///Function to hide all unit sections
function hideUnits() {
    unitDivs.forEach(div => div.style.display = 'none');
    unitQuizDiv.style.display = "none";
}

//Setup admin sub-nav panel and its actions
function setupNavBarAdmin() {
    adminLinks = Array.from(document.querySelectorAll('.sub-nav-link')); 

    adminLinks.forEach((adminLink, index) => {
        adminLink.addEventListener('click', (event) => {
            event.preventDefault(); //Stop window scroll jumping
            hideAdminOptions();

            unitDivs.forEach(div => div.style.display = 'none'); 
            sections.forEach(section => section.style.display = 'none');
            links.forEach(link => link.classList.remove('active')); 
            unitLinks.forEach(link => link.classList.remove('active')); 
            unitQuizDiv.style.display = "none"; //Hide quiz
            showMessage(message, ""); //Clear message

            if (subNav) subNav.style.display = "block"; //Show sub-nav
            if (links[1]) links[1].classList.add('active'); //Keep Admin tab highlighted
            adminLink.classList.add('active'); //Highlight clicked sub-nav item

            //-- Display admin options depending on action
            switch (index) {
                case 0: //New unit
                    uploadXML.style.display = "flex";
                    uploadUnitBtn.style.display = "block";
                    replaceUnitBtn.style.display = "none";
                    break;
                case 1: //Replace unit
                    uploadXML.style.display = "flex";
                    dropDown.style.display = "flex";
                    replaceUnitBtn.style.display = "block";
                    break;
                case 2: //Delete unit
                    dropDown.style.display = "flex";
                    replaceUnitBtn.style.display = "none";
                    break;
            }
        });
    });
    if (message.innerHTML.length > 0) {
        hideUnits(); //Hide units if admin, an edit was done
    } else {
        showSection(links[1], 1); //Default to admin section
        links[1].classList.add('active');
    }
}

//Function to hide all admin-related
function hideAdminOptions() {
    adminLinks.forEach(adminLink => adminLink.classList.remove('active'));
    unitDivs.forEach(div => div.style.display = 'none');
    if (uploadXML) uploadXML.style.display = "none";
    if (dropDown) dropDown.style.display = "none";
    if (uploadUnitBtn) uploadUnitBtn.style.display = "none";
}

/*Function for messages in login.php and index.php 
@param targetElement - The HTML element where the message will be displayed
@param message - message to display to the user
@param color - The color of text the message will be in 
(Define in global scope so accessible from other files 'script-login.js')*/
function showMessage(targetElement, message, color) {
    targetElement.innerHTML = message;
    targetElement.style.color = color;
}

//General create and configure XMLHttpRequest function

/*Function to handle GET requests
Uses promises to wait for the response and will resolve upon PHP data fetch
@param url - the url to the php file that will be loaded */
async function loadPHPFileGET(url){

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
                    //Return the data from the php file to the original function call
                    //console.log("GET php: " + xhr.responseText);
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
Uses promises to wait for the response and will resolve upon PHP data fetch
@param url - the url to the php file that will be loaded 
@param data - the data to use in the post*/
async function loadPHPFilePOST(url, data) {
    //console.log('loading PHP file (POST data: ', data , ')');

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => { //Return new promise
        xhr.open('POST', url, true);

        xhr.onload = () => {
            //console.log("Load php: " + xhr.responseText);
            if (xhr.status === 200) {
                try {
                    //Return the data from the php file to the original function call
                    //console.log(xhr.responseText);
                    //return JSON.parse(xhr.responseText);
                    resolve(JSON.parse(xhr.responseText)); //Resolve promise with parsed data
                } catch (e) {
                    console.log('Error parsing JSON:', e);
                    reject(e); //Reject promise if JSON parsing error
                }
            } else {
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

        xhr.send(data);  //Send POST data
    }); //Promise end
}