/* 

COMP 466 Web-Based Systems
TMA 3A

Erika Racette ID:  

This is the javascript file used for shared functions in TMA3 parts 3 & 4

*/

const subNav = document.getElementById('sub-nav'); //The sub nav links for comp parts

document.addEventListener('click', function(event) {
    //console.log('Cart: ', cart);
});

//Array of available computer parts and their associated properties
//Used for populating sections and aside content, and their associated type
const compPartsArray = [
    { Section: "section-1", Type: "Build", Aside: "aside-build", Part: "Prebuilt" },
    { Section: "section-2", Type: "OS", Aside: "aside-os", Part: "Operating System" },
    { Section: "section-3", Type: "CPU", Aside: "aside-cpu", Part: "CPU" },
    { Section: "section-4", Type: "RAM", Aside: "aside-ram", Part: "RAM" },
    { Section: "section-5", Type: "HardDrive", Aside: "aside-harddrive", Part: "Hard Drive" },
    { Section: "section-6", Type: "SoundCard", Aside: "aside-soundcard", Part: "Sound Card" },
    { Section: "section-7", Type: "Display", Aside: "aside-display", Part: "Display" }
];

//Cart object used to store the user's pc configuration
//Cart will be updated in the background each radio button click
const cart = {
    OrderID: null,
    OrderDate: null,
    OrderStatus: 0,
    OrderStatusMessage: "",
    BuildID: 0,
    BuildName: "",
    BuildDescription: "",
    OSID: null, OSName: "", OSPrice: 0,
    CPUID: null, CPUName: "", CPUPrice: 0,
    RAMID: null, RAMName: "", RAMPrice: 0,
    HardDriveID: null, HardDriveName: "", HardDrivePrice: 0,
    SoundCardID: null, SoundCardName: "", SoundCardPrice: 0,
    DisplayID: null, DisplayName: "", DisplayPrice: 0,
    TotalPrice: 0
};

//-------------------------------Update Functions-------------------------------
/* Function to update the total price displayed in the cart and order summary.
Loops through compPartsArray and sums each comp part's price. */
const cartPrice = document.getElementById('cart-price'); //The total $ of the cart in the cart header icon
const orderTotalSpan = document.getElementById('total-price-span'); //The styling of the total order
function updateTotalPrice() {
    const total = compPartsArray.slice(1).reduce((sum, part) => sum + cart[`${part.Type}Price`], 0);
    cart.TotalPrice = total; //Update the cart with the total price
    showMessage(cartPrice, `$${total}`); //Update the cart-price under the cart icon
    showMessage(orderTotalSpan, `$${total}`); //Update the total price in the order summary page
}

/* Function to update the associated comp part's aside section with it's details.
 @param entry - The object that's contents will be used in the aside 
 @param compPart - The matching entry for the associated 'part' in the compPartsArray
1. Get the asideID using the associated compPartsArray.aside
2. If the component is a 'build'
    a. Updates the build name in the aside
    b. Select all radio buttons that are used in the prebuilt
2. Else, the component is a regular part, update the respective part's name in the aside.
*/
function updateAside(entry, compPart) {
    //console.log("entry ",entry);console.log("compPart ",compPart);
    const asideSection = document.getElementById(compPart.Aside);
    if (compPart.Type === "Build") {
        showMessage(asideSection, `<h3>${entry.Name}</h3>`, "black");
        selectRelatedRadioButtons(entry);
    } else { //Was a regular comp part, update in the list
        showMessage(asideSection, `<b>${compPart.Part}:</b> ${entry.Name}`, "black");
    }
}

/* Function to update the cart with a specific part
1. Create a box div
2. Create an h3 with the build's name,
3. Create a list with the object array
4. Create a p with the build's description
5. Append box div to cartItemsDiv
@param - comptType
*/
function updateCart(entry, compType) {
    
    cart[`${compType}ID`] = entry.ID;
    cart[`${compType}Name`] = entry.Name;

    if (compType !== 'Build') {
        cart[`${compType}Price`] = parseFloat(entry.Price);
    } else {
        cart.BuildDescription = entry.Description;
    }
    updateTotalPrice();
}

//-------------------------------Populate Functions-------------------------------

/* Function to populate the order summary section with the cart
1. Create a box div
2. Create an h3 with the build's name,
3. Create a list with the object array
4. Create a p with the build's description
5. Append box div to cartItemsDiv
*/
const cartItemsDiv = document.getElementById('cart-items-div');
function populateCartSummary() {
    deleteBoxDivs(sections[9]);
    const boxDiv = createDiv("box");
    boxDiv.append(createH3(cart.BuildName, "black"));
    boxDiv.append(createList(cart));
    boxDiv.append(createP(cart.BuildDescription));
    cartItemsDiv.append(boxDiv);
}

/* Function to populate the account section with an existing order
Populates the order information with given parameters
1. Clears the userAccountOrdersDiv of any existing content
2. Check if the parameter is a valid array of objects
3. For each object in the array...
    a. Create a box div as the container of the order's information
    b. Create an h3 for the build's name
    c. Create a list and list the order's individual comp parts
    d. Create another div orderInfodiv inside of box div
    e. Append the ID, date, and status of the order to the orderInfodiv
    f. Create an h3 for the orders's total price
    g. If the order status is 0 (a newly created order that has yet to be paid for) add in a manage and cancel button
    f. Attatch actionlisteners to each button
    g. Append box div to userAccountOrdersDiv
3. Else, if dataArray was not an array/doesn't exist/does not contain any orders
    a. Create a box div as the container of the order's information
    b. Create an h3 tag telling user they have no orders
    c. Create a p tag telling user how to place an order
    g. Append box div to userAccountOrdersDiv
 @param dataArray - The array of objects that will be looped through to create existing orders for an account*/
const userAccountOrdersDiv = document.getElementById('user-account-orders-div'); //The account div that will hold the user's orders
async function populateAccount(dataArray) {
    showMessage(userAccountOrdersDiv, "");
    deleteBoxDivs(userAccountOrdersDiv);

    if (Array.isArray(dataArray) && dataArray.length > 0) {
        dataArray.forEach(entry => {
            const boxDiv = createDiv("box");
            boxDiv.append(createH3(entry.BuildName, "black"));
            boxDiv.append(createList(entry));

            const orderInfoDiv = createDiv();
            orderInfoDiv.append(createP(`<b>Order ID:</b> ${entry.OrderID}`));
            orderInfoDiv.append(createP(`<b>Order Date:</b> ${entry.OrderDate}`));
            orderInfoDiv.append(createP(`<b>Order Status:</b> ${entry.OrderStatusMessage}`));
            boxDiv.append(orderInfoDiv);
            boxDiv.append(createH3(`$${entry.TotalPrice}`));

            if (entry.OrderStatus === 0) {
                boxDiv.append(createButton("Manage Order", "orange-btn", () => {
                    if(manageOrder(entry)) {
                        showSection(links[1], 1);
                    }
                }));

                boxDiv.append(createButton("Cancel Order", "red-btn", async () => {
                    if (confirm("Are you sure you want to cancel this order?")) {
                        deleteOrder(entry);
                    }
                }));
            }
            userAccountOrdersDiv.append(boxDiv);
        });
    } else {
        const boxDiv = createDiv("box");
        boxDiv.append(createH3("No orders yet!", "black"));
        boxDiv.append(createP("It looks like you haven't placed any orders yet. To get started, browse our store and place your first order."));
        userAccountOrdersDiv.append(boxDiv);
    }
}

/* Function to populate the order success section
Populates the order information with given parameters
 @param OrderID - The ID of the order that was just made
 @param OrderDate - The date the order was created
 @param OrderTotal - The total price of the order */
function populateOrderSuccess(OrderID, OrderDate, OrderTotal) {
    showMessage(document.getElementById('success-id'), `<p><b>Order ID: </b> ${OrderID}</p>`);
    showMessage(document.getElementById('success-date'), `<p><b>Order Date: </b> ${OrderDate}</p>`);
    showMessage(document.getElementById('success-total'), `<p><b>Order Total: </b> $${OrderTotal}</p>`);
}

/* Function to manage an existing order
Uses an object's contents to replace the current cart
 @param entry - The object that's matching keys will be used for each cart value */
function manageOrder(entry) {
    Object.keys(entry).forEach(key => { //For each key item in entry
        if (cart.hasOwnProperty(key)) { //If the cart has a matching key
            cart[key] = entry[key]; //update the cart's key with the entry's value
        }
    });

    showSection(links[1], 1); //Redirect to the prebuilts tab
    showMessage(links[9], "Update Order"); //Set text to 'Update Order'
}

/* Remove all elements of a specified section that have the classname="box"
Used for re-loading sections
@param section - the section that will remove all box divs */
function deleteBoxDivs(section) {
    if (section instanceof HTMLElement) {
        section.querySelectorAll('.box').forEach(div => div.remove());
    }
}

/* Function to open email with feedback 
Get feedback form and button
Get text contents of it
Make sure user has 10 characters in it at least
Create the mailto link and put text contents in it
Open user's email app with contents*/
const feedbackForm = document.getElementById('feedback-form');
const feedbackButton = document.getElementById('feedback-button');
feedbackForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const feedbackText = document.getElementById('feedback-text').value.trim();

    if (feedbackText.length < 10) { //Check if under 10 characters
        alert("Please enter at least 10 characters of feedback.");
        return;
    }

    //Create mailto link
    const email = "builtdifferentpcsstore@gmail.com"; //Recipient email
    const subject = encodeURIComponent("Customer Feedback"); //Email subject
    const body = encodeURIComponent(feedbackText); //Email body
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink; //Open user's default mail client

    feedbackForm.reset();
});


//-------------------------------Dynamic html creation-------------------------------

/* Function to dynamically create a div
 @param className - The name of the newly created div's class */
 function createDiv(className) {
    const div = document.createElement("div");
    if(className) {div.className = className;}
    return div;
}

/* Function to dynamically create a header3
 @param text - The text in the h3
 @param color - The color of the text */
function createH3(text, color) {
    const h3 = document.createElement("h3");
    if(color) {
        showMessage(h3, text, color);
    } else {
        showMessage(h3, text);
    }
    return h3;
}

/* Function to dynamically create a radio and action listener for it
 @param entry - The object that's contents will be used in the radio 
 @param compPart - The name of the computer part to be applied to the radio and listener */
function createRadio(entry, compPart) {
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.value = entry.ID;
    radio.name = compPart.Type;

    radio.addEventListener("change", function() {
        if (radio.checked) { 
            updateAside(entry, compPart);
            updateCart(entry, compPart.Type);
        }
    });

    label.append(radio, document.createTextNode(entry.Name));
    return label;
}

/* Function to dynamically create a list
Loops through compPartsArray and creates an unordered list by extracting part names and prices from the entry object
 @param entry - The object that's contents will be used in the list */
function createList(entry) {
    const list = document.createElement('ul');
    compPartsArray.slice(1).forEach(compPartsEntry => {
        const item = document.createElement('li');
        const preBuiltPartName = entry[compPartsEntry.Type + "Name"];
        showMessage(item, `<b>${compPartsEntry.Part}:</b> ${preBuiltPartName} <br><i>$${entry[compPartsEntry.Type + "Price"]}</i>`);
        list.append(item);
    });
    return list;
}

/* Function to dynamically create a paragraph
 @param text - The text in the paragraph */
function createP(text) {
    const p = document.createElement("p");
    showMessage(p, text);
    return p;
}

/* Function to dynamically create a button
 @param text - The text in the button
 @param className - The button's class
 @param callback - The function that will run when clicking the button */
function createButton(text, className, callback) {
    const button = document.createElement("button");
    button.className = className;
    showMessage(button, text);
    button.addEventListener("click", callback);
    return button;
}

