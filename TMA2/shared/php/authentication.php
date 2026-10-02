<link rel="stylesheet" href="../../shared/styles/styles.css">

<div id="authentication-container">

    <div id="login" class="auth">
        <h2>Login</h2>
        <p>Existing Username:</p>

        <!-- form for login -->
        <form id="login-form" method="POST">
            <input type="text" name="username" placeholder="Username" required>
                <p>Password:</p>
                <input type="password" name="password" placeholder="Password" required>
                <br><button id="login-button" type="submit">Login</button>
        </form>

        <p id="login-message"></p>
    </div>

    <div id="register" class="auth">
        <h2>Register</h2>
        <p>Create Username:</p>

        <!-- form for register -->
        <form id="register-form" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <p>Password:</p>
            <input type="password" name="password" placeholder="Password" required>
            <br><button id="register-button" type="submit">Register</button>
        </form>

        <p id="register-message"></p>
    </div>

</div>

<script src="../js/script-navbar.js"></script>
<script>
//When the page is loaded...
document.addEventListener("DOMContentLoaded", function() {

    /*---------------- Register ----------------*/
    const registerForm = document.getElementById('register-form');
    const registerButton = document.getElementById('register-button');
    const registerMessage = document.getElementById('register-message');

    /*Listener for the register button
    Submits the form data to the server.

    When register button clicked:
    - It prevents default form submission behavior
    - It collects the registration form data using 'FormData' object
    - It sends the form data to 'register.php' via POST request with 'loadPHPFilePOST' function
 
    If the responds with register success:
    - A success message is displayed
    - The user is redirected to the "index.php" page after a short delay
  
    If the responds with an error:
    - Error message is displayed in the register message section
    */
    registerButton.addEventListener('click', async (event) => {

        const formData = prepareFormData(registerForm);
        
        const registerResponse = await loadPHPFilePOST('register.php', formData);

        if (registerResponse.success === true) { //If the response was successful

            authenticationSuccess(registerResponse, registerMessage);

        } else {
            showMessage(registerMessage, registerResponse.message, 'red'); //If login failed, show error message
        }
    });

    /* Prepare the form shared function */
    function prepareFormData(form) {
        event.preventDefault(); //Stop page from reloading

        const formData = new FormData(form); //Get form info
        const parentURL = window.parent.location.href;

        if (parentURL.includes("part1")) {
            formData.append("db_context", "part1");

        } else if (parentURL.includes("part2")) {
            formData.append("db_context", "part2");
        }

        /*
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        */
        return formData;
    }

    /*---------------- Login ----------------*/
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');

    /*Listener for the login button
    Submits the form data to the server.

    When login button clicked:
    - It prevents default form submission behavior
    - It collects the login form data using 'FormData' object
    - It sends the form data to 'login.php' via POST request with 'loadPHPFilePOST' function
 
    If the responds with login success:
    - A success message is displayed
    - The user is redirected to the "index.php" page after a short delay
  
    If the responds with an error:
    - Error message is displayed in the login message section
    */
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault(); //Stop page from reloading

        const formData = prepareFormData(loginForm);

        const loginResponse = await loadPHPFilePOST('login.php', formData);

        if (loginResponse.success === true) {

            authenticationSuccess(loginResponse, loginMessage);

        } else {
            //If error, text is red
            showMessage(loginMessage, loginResponse.message, 'red');
        }
    });

    /* Handle login/register success */
    function authenticationSuccess(response, messageDiv) {
        showMessage(messageDiv, response.message, 'green'); //If success, message is green

        if (window.parent && typeof window.parent.getUserBookmarks === 'function') {
            setTimeout(() => {
                bookmarkLoginSuccess(); 
            }, 1000);
        } else if (window.parent && typeof window.parent.getAdminStatus === 'function' && typeof window.parent.getUnits === 'function') {
            setTimeout(() => {
                OLMSLoginSuccess();
                }, 1000);
        } else {
            showMessage(messageDiv, "Could not authenticate", 'red');
        }
    }

    /* Handle visual changes and load user's units */
    function OLMSLoginSuccess() {
        showMessage(registerMessage, ""); //Reset messages
        showMessage(loginMessage, ""); //Reset message

        const loginNavLink = window.parent.document.getElementById('link-0');
        loginNavLink.style.display = "none";

        const iframe = window.parent.document.getElementById('frame-1'); //Hide the current iframe
        iframe.style.display = "none";

        window.parent.getAdminStatus();
    }

    /* Handle visual changes and load user's bookmarks */
    function bookmarkLoginSuccess() {
        showMessage(registerMessage, ""); //Reset messages
        showMessage(loginMessage, ""); //Reset message
        
        const logoutLink = window.parent.document.getElementById('link-2');
        logoutLink.style.display = "block";

        const loginNavLink = window.parent.document.getElementById('link-1');
        showMessage(loginNavLink, "My Bookmarks");

        const userBookmarksDiv = window.parent.document.getElementById('user-bookmarks');
        userBookmarksDiv.style.display = "block";

        const iframe = window.parent.document.getElementById('frame-1'); //Hide the current iframe
        iframe.style.display = "none";

        window.parent.getUserBookmarks();
    }
});
</script>