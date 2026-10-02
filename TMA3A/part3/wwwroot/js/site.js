/* 

COMP 466 Web-Based Systems
TMA 3

Erika Racette ID:  

This is the javascript file used in part 3 

*/

document.addEventListener("DOMContentLoaded", () => { //When page has finished loading
    initializeRadioListeners(); //Initialize radio button listeners to detect part selection
    initializeFirstPrebuilt(); //Auto-select the first prebuilt build
});

//-------------------------------Initialize functions-------------------------------


/* Function to initialize radio input listeners
1. Loop through each radio input on the page
2. Add a change event listener to each input
3. When change detected:
    a. Get the component type (from the radio's name)
    b. Get the closest .box container and label text
    c. Extract the description from the box which will be in the <p> tag
    d. Build an entry object with all relevant info
    e. Update the cart and aside content with this entry
    f. If the component is a prebuilt build, auto-select related parts */
function initializeRadioListeners() {
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener("change", () => {
            const compType = radio.name;
            const boxDiv = radio.closest('.box');
            const label = radio.parentElement;
            const Description = boxDiv.querySelector('p')?.textContent.trim() || "";

            const entry = {
                ID: radio.value,
                Name: label.textContent.replace(radio.outerHTML, "").trim(),
                Price: radio.dataset.price,
                Description
            };

            updateCart(entry, compType);
            const compPart = compPartsArray.find(c => c.Type == compType);
            updateAside(entry, compPart);
            
            if (compType === "Build") { //If selecting a prebuilt build, auto-select related parts
                selectRelatedRadioButtons(entry.ID);
            }
        });
    });
}

/* Function to auto-select related components when a prebuilt build is chosen
1. Find the selected build's radio button
2. Get its container box
3. Loop through each component listed in the build's <ul>
4. Find and trigger(click) the corresponding radio button for each part
@param BuildID - The ID of the selected build */
function selectRelatedRadioButtons(BuildID) {
    const buildRadioButton = document.querySelector(`input[name='Build'][value='${BuildID}']`);
    const buildBox = buildRadioButton?.closest(".box");

    if (!buildBox) return;

    buildBox.querySelectorAll("ul li").forEach(li => {
        const value = li.getAttribute("value");
        if (!value) return;

        const componentRadio = document.querySelector(`input[type='radio'][value='${value}']:not([name='Build'])`);
        if (componentRadio) {
            componentRadio.checked = true;
            componentRadio.dispatchEvent(new Event('change'));
        }
    });
}

/* Function to select the first prebuilt build when page loads
Finds the first radio input with name 'build'
Clicks it to trigger selection and update UI */
function initializeFirstPrebuilt() {
    const firstPrebuilt = document.querySelector('input[name="Build"]');
    if (firstPrebuilt) {
        firstPrebuilt.checked = true;
        firstPrebuilt.dispatchEvent(new Event('change'));
    }
    showMessage(cartPrice, '$0.00'); //Display $0.00 as the total price to the user initially
}

//-------------------------------Cookie functions-------------------------------

/* Function to save the current cart as a cookie
1. Get any existing orders from the cookie
2. If cart already has an order ID, find and update it
3. If not, assign a new order ID and push it into orders
4. Update the cookie with the modified orders array
@returns true if order was saved successfully, false if failed */
async function setOrdersCookie() {

    const orders = await getOrdersFromCookie() || []; //Fetch the user's orders using cookies, if not fetched, empty array
    //console.log("setOrdersCookie: ", orders);
    if (cart.OrderID) { //If the cart started with an OrderID initialized
        const index = orders.findIndex(order => order.OrderID === cart.OrderID); //Find the entry in the array with that OrderID

        if (index !== -1) { //If the OrderID was not -1
            orders[index] = cart; //Update the existing order entry with what is currently present in the cart
        } else { //Else, it was -1, alert user
            alert("Could not modify order. Please come in-store or contact us");
            return false;
        }
    } else { //New order
        //Check if there are any existing orders in the orders array
        //Create a new array with only the OrderIDs from each order
        //If there are no orders, default OrderID is 0
        //newOrderID either be the highest existing OrderID or 0 if there are no orders yet
        const newOrderID = orders.length > 0 ? Math.max(...orders.map(order => order.OrderID)) : 0;
        cart.OrderID = newOrderID + 1; //Add +1 so OrderID's start at 1
        orders.push(cart);
    }

    updateOrdersCookie(orders);
    return true; //Return true

}

/* Function to get all saved orders from the cookie
@returns - Array of orders or null if cookie doesn't exist */
function getOrdersFromCookie() {
    const match = document.cookie.match(/(?:^|; )Orders=([^;]*)/);
    return match ? JSON.parse(decodeURIComponent(match[1])) : null; //Return null if no match
}

/* Function to update the cookie with new orders array
@param orders - Array of order objects to be saved
*/
function updateOrdersCookie(orders) {
    const ordersString = JSON.stringify(orders);
    //Cookie will expire 7 days after being set (Built Different Pcs will delete orders not paid for in 7 days)
    //Cookie is accessible across entire website
    document.cookie = `Orders=${encodeURIComponent(ordersString)};max-age=${7 * 24 * 60 * 60};path=/`;
}

/* Function to finalize and store the user's order
1. Assign order date and status to cart
2. Call setOrdersCookie to save it
3. Show a success message with order info
@returns true if successful, false if failed */
async function placeOrder() {
    cart.OrderDate = new Date().toLocaleString();
    cart.OrderStatus = 0;
    cart.OrderStatusMessage = "Awaiting In-Person Payment"; //Default message

    if (await setOrdersCookie()) { //Add current cart to the cookie, if successful
        populateOrderSuccess(cart.OrderID, cart.OrderDate, cart.TotalPrice); //Show success message with order details
        resetOrdering();
        return true; //Returns value for showSection();
    } else {
        return false;
    }
}

/* Function to retrieve and populate orders in the Account section
Retrieves saved orders from cookies
Calls populateAccount() to display the retrieved orders */
async function getAccountOrders() {
    const orders = await getOrdersFromCookie();
    //console.log("getAccountOrders: ", orders);
    populateAccount(orders);
}

//-------------------------------Order Management functions-------------------------------

/* Function to delete a saved order
1. Gets orders from cookies
2. Finds the order by ID and removes it
3. Updates the cookie with the new array
4. Refreshes the user's account section
@param entry - The order object to delete */
async function deleteOrder(entry) {
    const orders = await getOrdersFromCookie();
    //console.log("deleteOrder: ", orders);
    if (Array.isArray(orders)) {
        const index = orders.findIndex(order => order.OrderID === entry.OrderID);

        if (index !== -1) {
            orders.splice(index, 1);
            updateOrdersCookie(orders);
        } else {
            alert("Could not cancel order. Please come in-store or contact us.");
        }
        getAccountOrders(); //Refresh account orders
    }
}

/* Function to reset the web app to initial ordering state
Loops through all keys in cart and resets their values
Resets button texts to their default values. */
function resetOrdering() {
    Object.keys(cart).forEach(key => {
        cart[key] = null; //Set each key in cart as null
    });
    initializeFirstPrebuilt(); //Re-select the 1st prebuilt
}

