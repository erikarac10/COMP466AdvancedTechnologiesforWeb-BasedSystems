/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This is the javascript file used for part1 index.html (user bookmark homepage)

Tutorials used:

-Validating a URL
https://www.freecodecamp.org/news/how-to-validate-urls-in-javascript/
https://dmitripavlutin.com/javascript-fetch-async-await/

*/

//When the page is loaded...
document.addEventListener("DOMContentLoaded", function () {

    //...Fetch popular bookmarks
    getPopularBookmarks();

    //getUserBookmarks();

});

/* Fetches and displays the top 10 most popular bookmarks on home page
 
This function calls the 'loadPHPFileGET' function to send a GET request to the
'get_user_bookmarks.php' file. It processes the response to dynamically populate
the uuser's bookmarks section with the fetched data
 
If the fetch is successful:
- It iterates over the list of bookmarks returned
- For each bookmark it creates a clickable list item with the title and URL
- The list items are appended to the bookmarks section on the user's homepage

If the fetch fails:
- An error message is displayed in the bookmarks section
*/
async function getPopularBookmarks() {

    const bookmarkList = document.getElementById('popular-bookmark-list'); //The div element where the popular bookmarks will be placed in

    const bookmarkResponse = await loadPHPFileGET('./php/get_top_bookmarks.php'); //Use the response of the php file 'get_top_bookmarks.php'

    //console.log("bookmarkResponse: ", bookmarkResponse);
    //If was response successful...
    if (bookmarkResponse.success === true) {

        if (bookmarkResponse.array.length > 0) { //If there are bookmarks

            showMessage(bookmarkList, ""); //Clear content

            //For each item in the parsed data array
            bookmarkResponse.array.forEach(bookmark => {
                /* ---Setup each link--- */
                const listItem = document.createElement('li'); //Create a new list item
                listItem.className = 'bookmark-list';

                const linkItem = document.createElement('a'); //Make it a href
                linkItem.href = bookmark.url; //Give it the redirect of the URL
                //linkItem.textContent = `${bookmark.title} - ${bookmark.url}`; //Format the text (Title) - (URL)
                linkItem.textContent = bookmark.url; //Display popular bookmark URL
                linkItem.target = '_blank'; //When clicked, open in a new tab
                listItem.appendChild(linkItem); //Add the created link to list
                bookmarkList.appendChild(listItem); //Add list item to list
            });
        } //Else, no bookmarks saved

    } else { //Couldn't get the bookmarks
        showMessage(bookmarkList, '<li>Error loading bookmarks.</li>', 'black'); //List error message
    }
}

/* Fetches and displays the user's previously saved bookmarks in recent order on their home page
 
This function calls the 'loadPHPFileGET' function to send a GET request to the
'get_user_bookmarks.php' file. It processes the response to dynamically populate
the uuser's bookmarks section with the fetched data
 
If the fetch is successful:
- It iterates over the list of bookmarks returned
- For each bookmark it creates a clickable list item with the title and URL
- The list items are appended to the bookmarks section on the user's homepage

If the fetch fails:
- An error message is displayed in the bookmarks section
*/
async function getUserBookmarks() {

    const bookmarkList = document.getElementById('bookmark-list'); //The div element where the user's bookmarks will be placed in
    const usernameDiv = document.getElementById('username'); //Get their username and display it
    const bookmarkCountDiv = document.getElementById('bookmark-count'); //How many bookmarks the user has

    const bookmarkResponse = await loadPHPFileGET('./php/get_user_bookmarks.php'); //Use the response of the php file 'get_user_bookmarks.php'

    //console.log("bookmarkResponse: ", bookmarkResponse);
    showMessage(bookmarkList, ""); //Clear content
    //If was response successful...
    if (bookmarkResponse.success === true) {
        
        //Display the user bookmarks with the response
        showMessage(usernameDiv, " " + bookmarkResponse.message); //Display user's username
        showMessage(bookmarkCountDiv, bookmarkResponse.array.length); //Update the bookmark count

        if (bookmarkResponse.array.length > 0) { //If the user has bookmarks saved

            //For each item in the parsed data array
            bookmarkResponse.array.forEach(bookmark => {
                /* ---Setup each link--- */
                const listItem = document.createElement('li'); //Create a new list item
                listItem.className = 'bookmark-list';

                const linkItem = document.createElement('a'); //Make it a href
                linkItem.href = bookmark.url; //Give it the redirect of the URL
                showMessage(linkItem, `${bookmark.title} - ${bookmark.url}`); //Format the text (Title) - (URL)
                linkItem.target = '_blank'; //When clicked, open in a new tab
                listItem.appendChild(linkItem); //Add the created link to list

                /* ---Setup edit and delete buttons for each link--- */
                //Create and set up the manage container
                const manageContainer = document.createElement('span');
                manageContainer.className = 'bookmark-manage-container';

                //Create and set up the edit link
                const editLink = document.createElement('a');
                showMessage(editLink, '[Edit]');

                //Create and set up the delete link
                const deleteLink = document.createElement('a');
                showMessage(deleteLink, '[Delete]');

                //Attach Listeners
                editLink.addEventListener('click', () => editBookmark(bookmark.bookmark_id, bookmark.title, bookmark.url)); //Edit event listener
                deleteLink.addEventListener('click', () => deleteBookmark(bookmark.bookmark_id)); //Delete event listener

                //Add the edit and delete links to the manage container
                manageContainer.appendChild(editLink);
                manageContainer.appendChild(document.createTextNode(' | ')); //Add seperator between edit|delete
                manageContainer.appendChild(deleteLink);

                //Add the manage container to the list item
                listItem.appendChild(manageContainer);
                bookmarkList.appendChild(listItem); //Add list item to list
            });
        } else { //Else, the user has no bookmarks saved
            //showMessage(bookmarkList, "<li>You have no bookmarks!</li>"); //No bookmarks
        }
    } else if (bookmarkResponse.success === false && bookmarkResponse.message == 'Not Logged In') { //Else, user was not logged on

        //window.location.href = '../tma2.htm';
        return; //Exit

    } else { //Couldn't get the bookmarks
        showMessage(bookmarkList, '<li>Error loading bookmarks.</li>', 'black'); //List error message
    }
}

/*---------------- Make changes to a bookmark ----------------*/
const headerMessage = document.getElementById('bookmark-header'); //The header used to indicate what bookmark manipultion is being made (new/edit)

/*Function that will trigger edit bookmark changes
@param bookmarkID - The ID of the bookmark
@param bookmarkTitle - The title of the selected bookmak
@param bookmarkURL - The URL of the selected bookmark
*/
function editBookmark(bookmarkID, bookmarkTitle, bookmarkURL) {
    //Hide Add bookmark button and display Edit bookmark buttons
    addBookmarkBtn.style.display = "none";
    editBookmarkBtn.style.display = "block";
    cancelBookmarkBtn.style.display = "block";

    showMessage(headerMessage, "Editing Bookmark... ", 'black'); //Change bookmark message to indicate editing existing
    showMessage(bookmarkMessage, ""); //Clear message

    //console.log("bookmarkForm: ", bookmarkForm);
    bookmarkForm.bookmarkId.value = bookmarkID; //Give the form the id of the bookmark being edited
    bookmarkForm.title.value = bookmarkTitle; //Add in what the title and URL is currently
    bookmarkForm.url.value = bookmarkURL; //Value is the URL
}

/*Listener for the Cancel Edit button
Returns to the "Add Bookmark" view and hides the "Edit Bookmark" form.

When cancel edit button clicked:
- Shows 'Add Bookmark' button and hides 'Edit Bookmark' form and 'Cancel' button
- Clears 'bookmarkMessage' section
- Clears the bookmark form by setting title and URL fields to empty
*/
const cancelBookmarkBtn = document.getElementById('cancel-btn'); //Cancel edit bookmark button

cancelBookmarkBtn.addEventListener('click', async () => {

    //Return add bookmark content and hide edit bookmark content
    addBookmarkBtn.style.display = "block";
    editBookmarkBtn.style.display = "none";
    cancelBookmarkBtn.style.display = "none";

    showMessage(headerMessage, "Add Bookmark", 'black');
    showMessage(bookmarkMessage, ""); //Clear

    bookmarkForm.title.value = ""; //Clear bookmark title
    bookmarkForm.url.value = ""; //Clear bookmark url
});

/*---------------- Add/Edit a bookmark ----------------*/
/*Listeners for the add/edit button
Submits the form data to the server

When add/edit button clicked:
- It prevents default form submission behavior
- Will run handleBookmarkAction():
- It collects the new bookmark data (title and URL) using 'FormData' object
- It sends the form data to 'add_bookmark.php' or 'edit_bookmark.php' via POST request with 'loadPHPFilePOST' function
 
If responds with success:
- A success message is displayed
- The user's bookmarks list is refreshed
 
If responds with an error:
- Error message is displayed in the general bookmarks message section
*/
const bookmarkForm = document.getElementById('bookmark-form'); //Add and edit bookmark form
const addBookmarkBtn = document.getElementById('add-btn'); //Add bookmark button is clicked
const editBookmarkBtn = document.getElementById('edit-btn'); //Edit bookmark button
const bookmarkMessage = document.getElementById('message'); //Output messages to general message <p>

addBookmarkBtn.addEventListener('click', async (event) => {
    event.preventDefault(); //Stop page from reloading
    handleBookmarkAction('php/add_bookmark.php'); //Submit form using add_bookmark.php file
});

editBookmarkBtn.addEventListener('click', async (event) => {
    event.preventDefault(); //Stop page from reloading
    handleBookmarkAction('php/edit_bookmark.php'); //Submit form using edit_bookmark.php file
});

/*Function that will add a new bookmark or edit existing bookmark depending on which action listener called it
@param phpFileString - The php file to use in the loadPHPFilePOST function
*/
async function handleBookmarkAction(phpFileString) {
    const formData = new FormData(bookmarkForm); //Get form info
    const urlInput = formData.get('url').trim(); //Extract the URL from the form

    //Validate the URL, variable will hold whether it is valid or not and the new URL
    const [isValid, message] = await validateURL(urlInput); //Check if valid URL

    if (isValid) { //If it was a valid URL
        formData.set('url', message); //Update the form data with the validated URL

        const actionResponse = await loadPHPFilePOST(phpFileString, formData);

        if (actionResponse.success === true) { //If the response was successful

            showMessage(bookmarkMessage, actionResponse.message, 'green'); //Show success message

            getUserBookmarks(); //Refresh user's bookmarks

        } else {
            showMessage(bookmarkMessage, actionResponse.message, 'red'); //If add failed, show error message
        }
    } else {
        showMessage(bookmarkMessage, message, 'red'); //Was not valid URL, show message
    }
}

/*Function that will validate a URL
@param urlString - The string that will be tested to see if it is a valid URL
*/
async function validateURL(urlString) {
    //console.log("Validating: ", urlString);
    //Check to see if the url has 'https://' or 'http://'
    if (!/^https?:\/\//i.test(urlString)) {
        urlString = `https://${urlString}`; //If the URL doesn't have a protocol, add https
    }

    //Check if URL has a valid domain extension
    //const validTLDs = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\/.*)?$/; //Checks for any TLD that is 2 or more characters long (like .com .jp .hk)
    const validTLDs = /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/.*)?$/; //Also count URLs with multiple dots (.)
    if (!validTLDs.test(urlString)) {
        return [false, "Invalid or missing domain extension"]; //Return null if invalid
    }

    try { //Try validating the URL with URL constructor
        const validatedUrl = new URL(urlString);

        //Check if the URL is active by making a HTTP request
        /*const response = await fetch(validatedUrl.href, { method: 'HEAD' });

        if (response.ok) { //If response was ok (true)
            return [true, validatedUrl.href]; //Return the normalized URL if active (status 200-299)
        } else { //Else, could not establish connection, return message
            return [false, "Could not connect to the URL"];
        }
        */
        //For 'blocked by CORS policy'
        const response = await fetch(`php/check_url.php?url=${encodeURIComponent(validatedUrl.href)}`);
        const result = await response.json();
        
        if (result.active) {
            return [true, validatedUrl.href];
        } else {
            return [false, "Could not connect to the URL"];
        }

    } catch (error) { //Any other errors
        return [false, "Invalid URL or unable to reach the URL"];
    }
}

/*---------------- Delete a bookmark ----------------*/
/*Function to delete a specific bookmark
@param bookmarkID - The id of the specific bookmark that will be deleted 
 
When delete button clicked for a bookmark:
- A confirmation prompt is displayed to the user asking if they are sure they want to delete
 
If user presses Confirm:
- Specific bookmarkID is sent in form data to 'delete_bookmark.php' via POST request with 'loadPHPFilePOST' function
 
If the responds with register success:
- A success message is displayed
- The user's bookmark list is reloaded
 
If the responds with an error:
- Error message is displayed in the bookmark message section
*/
async function deleteBookmark(bookmarkID) {
    //console.log("Bookmark ID: " + bookmarkID);
    //Prompt confirm alert box with the specfied text
    if (confirm('Are you sure you want to delete this bookmark?')) { //If yes,

        bookmarkForm.bookmarkId.value = bookmarkID; //Give the form the id of the bookmark being edited
        const formData = new FormData(bookmarkForm); //Get all form data
        const deleteResponse = await loadPHPFilePOST('php/delete_bookmark.php', formData);

        if (deleteResponse.success === true) { //If the response was successful

            showMessage(bookmarkMessage, deleteResponse.message, 'green'); //Show success message

            getUserBookmarks(); //Reload user bookmarks

        } else {
            showMessage(bookmarkMessage, deleteResponse.message, 'red'); //If delete failed, show error message
        }
    }
}

/*---------------- Logout ----------------*/
/*Function to logout the user

When logout button clicked for a bookmark:

- '../shared/php/logout.php' via POST request with 'loadPHPFilePOST' function
 
If the responds with register success:
- User's session is ended
- Resets web app to state before login
 
If the responds with an error:
- Logout failed, session was not ended
*/
const LogoutBtn = document.getElementById('link-2'); //Logout link

LogoutBtn.addEventListener('click', async (event) => {
    event.preventDefault(); //Stop page from reloading
    const logoutResponse = await loadPHPFilePOST('../shared/php/logout.php'); //End the session

    if (logoutResponse.success === true) { //If the response was successful

        showMessage(links[1], "Login"); //Replace login message

        LogoutBtn.style.display = "none"; //Hide logout button again

        const userBookmarksDiv = document.getElementById('user-bookmarks'); //Hide user bookmarks
        userBookmarksDiv.style.display = "none";

        const iframe = document.getElementById('frame-1'); //Show authentication
        iframe.style.display = "block";

        showSection(links[0], 0); //Return to home page

    } else {
        //console.log("logoutResponse: ", logoutResponse);
        showMessage(links[1], logoutResponse.message); 
    }
});