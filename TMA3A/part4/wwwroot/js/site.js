/* 

COMP 466 Web-Based Systems
TMA 3A

Erika Racette ID:  

This is the javascript file used in part 4

*/
document.addEventListener("DOMContentLoaded", () => { //When page has finished loading
    getAllCompParts();
});

//-------------------------------Fetch & Populate Functions-------------------------------

/* Function to fetch component and prebuilt data
1. Call loadASPFileGET on 'GetAllCompParts'
2. If successful, separate data into prebuilts and compParts
3. Populate component parts and prebuilts
4. If unsuccessful, display error message
*/
async function getAllCompParts() {
    try {
        const response = await loadASPFileGET('http://localhost:5188/api/CompParts/GetAllCompParts');

        if (response.success == true) {
            const [compPartsData, prebuiltsData] = [response.array1, response.array2];
            await populateComponentParts(compPartsData);
            await populatePrebuilts(prebuiltsData);
        } else {
            sections[1].append(createP(response.message));
        }
    } catch (error) {
        sections[1].append(createP("An error occurred while loading components."));
        console.log("Error: ", error);
    }
}

/* Function to populate individual component sections
1. Loop through each dataArray entry
2. For each entry
    a. Find the matching compPart type
    b. Find the matching compPart section
    c. Clear the contents of the section before adding to it
    d. Create a box div
    e. Create a radio with the entry,
    f. Create a list with the object array
    g. Create a p with the build's description
    h. Create a h3 with the build's total price
    i. Append it all to box div
@param dataArray - Array of individual component part objects
*/
async function populateComponentParts(dataArray) {

    compPartsArray.forEach(Section => {
        deleteBoxDivs(Section); //Clear contents of the section before adding to it
    });

    dataArray.forEach(entry => {
        const compPart = compPartsArray.find(c => c.Type === entry.Type);
        const section = document.getElementById(compPart.Section);
        const boxDiv = createDiv("box");
        boxDiv.append(
            createRadio(entry, compPart),
            createP(entry.Description),
            createH3(`$${entry.Price}`)
        );
        
        section.append(boxDiv);
    });
}
/* Function to populate prebuilt configurations
1. Clear contents of the Prebuilts section
2. For each prebuilt entry:
    a. Find the matching compPart section
    b. Create a box div
    c. Create a radio with the entry,
    d. Create a list with the object array
    e. Create a p with the build's description
    f. Create a h3 with the build's total price
    g. Append it all to box div
    h. If it was the first prebuitl radio made, click it
    b. Create a box div and add:
        - radio input
        - list of components
        - description (p tag)
        - price (h3)
    c. Auto-select the first prebuilt:
        - Click its radio
        - Update aside and cart
3. Set total price to $0.00 initially
@param dataArray - Array of prebuilt build objects */
async function populatePrebuilts(dataArray) {
    deleteBoxDivs(sections[1]); //Clear contents of the prebuilts section before adding to it
    dataArray.forEach((entry, index) => {
        const compPart = compPartsArray.find(c => c.Type === entry.Type);

        const boxDiv = createDiv("box");
        boxDiv.append(
            createRadio(entry, compPart),
            createList(entry),
            createP(entry.Description),
            createH3(`$${entry.Price}`)
        );

        if (index === 0) { //Auto-select the first prebuilt
            const radio = boxDiv.querySelector("input");
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }

        sections[1].append(boxDiv); //Append to pre-built section
    });
    showMessage(cartPrice, '$0.00'); //Display $0.00 as the total price to the user
}

/* Function to select matching radio buttons when a prebuilt is selected
Loop through compPartsArray and match part's IDs
1. Skip 'build' type
2. Get each parts's ID from the prebuilt entry's keys
3. Find the matching radio buttons
    a. Separate each radio button by their part (radio name)
    b. Find the value of the radio (partID)
    c. Simulate click on that radio
@param entry - The prebuilt object */
function selectRelatedRadioButtons(entry) {
    compPartsArray.forEach(compPart => {
        if (compPart.Type === "build") return;

        const partID = entry[`${compPart.Type}ID`];
        const radio = document.querySelector(`input[name='${compPart.Type}'][value='${partID}']`);

        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }
    });
}

/* Function to fetch user’s past orders and display them on the account page
1. Check if userID is valid
2. If so, call loadASPFileGET on 'GetUserOrders'
3. If successful, hide the main frame and populate account with response data
4. If not, display error message
@param userID - The logged-in user’s ID
*/

/* Function to retrieve and populate orders in the Account section
Retrieves saved orders from database
1. GET 'GetUserOrders'
2. If successful, 
    a. Hide the iframe
    b. Reload user's orders, return true
2. Else, show error/no orders message */
async function getAccountOrders() {

    const authenticationDiv = document.getElementById('authentication-div');

    const response = await loadASPFileGET('http://localhost:5188/api/CompParts/GetUserOrders');

    if (response.message == "Not authorized") {

        //User is not logged in
        authenticationDiv.style.display = "block";
        userAccountOrdersDiv.style.display = "none";

    } else if (response.success == true) {

        //User is logged in
        authenticationDiv.style.display = "none";
        userAccountOrdersDiv.style.display = "block";

        populateAccount(response.array);
    }
}

/* Function to submit an order to the database
1. POST the current cart to 'SubmitOrder'
2. If successful, 
    a. Populate the order success section with the order just placed
    b. Reload user's orders, return true
2. Else, return false for showSection() */
async function placeOrder() {

    const response = await loadASPFilePOST('http://localhost:5188/api/CompParts/SubmitOrder', cart);
    if (response.success == true) {
        populateOrderSuccess(response.OrderID, response.OrderDate, response.TotalPrice);
        resetOrdering();
        if(response.UserID > -1) { //If the userID is not -1 (guest order)
            getAccountOrders();
            return true;
        }
    } else {
        return false;
    }
}

/* Function to delete a saved order
1. POST the order ID to 'DeleteOrder'
2. Finds the order by ID in the database and deletes it, 
3. If deletion successful,
    a. Refreshes the user's account section with getAccountOrders()
    b. Reload user's orders and alert the user
3. Else,
    a. Alert user their order could not be deleted
@param entry - The order object, will extract it's ID to delete */
async function deleteOrder(entry){ 
    const response = await loadASPFilePOST('http://localhost:5188/api/CompParts/DeleteOrder', entry.OrderID);
    if (response.success == true) {
        getAccountOrders();
        alert("Order cancelled successfully");
    } else {
        alert("Could not cancel order. Please come in-store or contact us");
    }
}

/* Function to reset the web app to initial ordering state
Loops through all keys in cart and resets their values
Reloads all components and prebuilt options
Resets button texts to their default values. */
function resetOrdering() {
    Object.keys(cart).forEach(key => {
        cart[key] = null; //Set each key in cart as null
    });    
    getAllCompParts(); //Call getAllCompParts once again and load in all comp + prebuilts
}
