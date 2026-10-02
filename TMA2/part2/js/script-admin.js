/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This is the javascript file used for part2 admin unit management

*/

//When the page is loaded...
document.addEventListener("DOMContentLoaded", function() {

    //Setup nav bar for the admin app
    //setupNavBarAdmin();

    //...Fetch the current units available
    //getUnits();
});

/* Fetches and displays the user's admin status
 
This function calls the 'loadPHPFileGET' function to send a GET request to the
'get_admin_status.php' file. It processes the response to get the user's admin status stored in the databse.
 
If the fetch is successful:
- Checks whether the user is an admin (admin status = 1)
- If the user is an admin, the admin link and section are displayed

Will then load all units with their admin stats.
*/
async function getAdminStatus() {

    const adminResponse = await loadPHPFileGET('php/admin/get_admin_status.php'); //Use the response of the php file 'get_user_bookmarks.php'
    //console.log("adminResponse: ", adminResponse);

    //If was response successful...
    if (adminResponse.success === true && adminResponse.is_admin === 1) { //If user is admin

        //Display admin link and section
        links[1].style.display = "block"; //Show admin link
        setupNavBarAdmin();

    }
    getUnits(adminResponse.is_admin);
}

/* Fetches and displays the units saved in the database onto the learning admin management
 
This function calls the 'loadPHPFileGET' function to send a GET request to the
'get_units.php' file. It processes the response to dynamically populate
the admin management with the fetched data
 
If the fetch is successful:
- It iterates over the list of units returned
- For each unit title, it is added it to the unit management dropdown menu
- The unit items are appended

If the fetch fails:
- An error message is displayed in the admin management section
*/
const unitSelect = document.getElementById('unit-select');

async function populateAdminUnits(response) {
    
    //Clear any existing content
    //showMessage(message, "");
    showMessage(unitSelect, "");

    //If was response successful...
    if (response.success === true) {

        //For each item in the parsed data array
        response.array.forEach(unit => {
            //Create option elements for each of the units
            const option = document.createElement('option');
            option.value = unit.unit_id;
            option.textContent = unit.unit_title;

            //Append unit option to the element
            unitSelect.appendChild(option);
        });
    } else { //Couldn't get the units
        showMessage(message, response.message, 'red'); //List error message
    }
}

/*---------------- Add/Edit a unit ----------------*/
/*Listeners for the new/edit/delete unit button
Submits the form data to the server

When add/edit/delete button clicked:
- It prevents default form submission behavior
- Will run handleAdminAction():
- It collects the new unit data (XML file) and/or dropdown option selection using 'FormData' object
- It sends the form data to 'add_unit.php', 'edit_unit.php' or 'delete_unit.php' via POST request with 'loadPHPFilePOST' function
 
If responds with success:
- A success message is displayed
- The units list is refreshed
 
If responds with an error:
- Error message is displayed in the general admin message section
*/

//Admin buttons
const addUnitBtn = document.getElementById('button-1'); //New unit button
const editUnitBtn = document.getElementById('button-2'); //Existing unit button
const deleteUnitBtn = document.getElementById('button-3'); //Delete unit button

addUnitBtn.addEventListener('click', async (event) => {
    event.preventDefault(); //Stop page from reloading
    handleAdminAction(1, 'php/admin/add_unit.php'); //Submit form using add_unit.php file
});

editUnitBtn.addEventListener('click', async (event) => {
    event.preventDefault(); //Stop page from reloading
    handleAdminAction(2, 'php/admin/replace_unit.php'); //Submit form using edit_unit.php file
});


deleteUnitBtn.addEventListener('click', async (event) => {
    event.preventDefault(); //Stop page from reloading
    handleAdminAction(3, 'php/admin/delete_unit.php'); //Submit form using delete_unit.php file
});

const uploadForm = document.getElementById('upload-form'); //XML upload form
const dropdownForm = document.getElementById('drop-down-form'); //Unit select form

/*Function that will add a new unit or edit existing unit depending on which action listener called it
@param action - The action being made: 1- New, 2- Edit, 3- Delete
@param phpFileString - The ID of the unit
*/
async function handleAdminAction(action, phpFileString) {

    let formData; //The uploaded form (can be unit selection or XML file)

    if (action == 1 || action == 2) { //Add or Edit

        showMessage(message, "Uploading...", 'green');

        //Get selected unit to replace by checking the currently selected dropdown menu item
        formData = new FormData(uploadForm); //Get uploaded XML file in form

        if (action == 2) { //Edit

            formData.append('unit_id', unitSelect.value); //Append selected unit in the dropdown to the original XML file form

        }

    } else if (action == 3) { //Delete

        //UnitId = The hidden input field for unit selection 
        dropdownForm.unitId.value = unitSelect.value; //Set selected unit to the dropdown form
        formData = new FormData(dropdownForm); //Get selected unit to delete (value is unit_id)
        
    } else {
        showMessage(message, "Could not manage unit", 'red');
    }

    //console.log("formData: ", formData);
    //console.log("formData entries:", [...formData.entries()]);

    const actionResponse = await loadPHPFilePOST(phpFileString, formData);

    if (actionResponse.success === true) { //If the response was successful

        showMessage(message, actionResponse.message, 'green'); //Show success message

    } else {
        showMessage(message, actionResponse.message, 'red'); //If upload failed, show error message
    }

    uploadForm.reset(); //Clear the file input
    unitLinks = []; //Reset links and divs
    unitDivs = [];
    showMessage(unitLinkDiv, ""); //Clear previous links in nav bar
    showMessage(unitContentDiv, "");
    getAdminStatus();
}
