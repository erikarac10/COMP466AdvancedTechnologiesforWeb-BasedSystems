
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
    - It sends the form data to 'Register'' via POST request
 
    If the responds with register success:
    - A success message is displayed
	- A password recovery link is sent to the user's email
  
    If the responds with an error:
    - Error message is displayed in the register message section
    */
    registerButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm); //Get register form info

        if(formData) {
            const registerResponse = await loadASPFilePOST('http://localhost:5188/api/Auth/Register', formData);

            if (registerResponse.success === true) { //If the response was successful

                authenticationSuccess(registerResponse, registerMessage);

            } else {
                showMessage(registerMessage, registerResponse.message, 'red'); //If register failed, show error message
            }
        }
    });

    /*---------------- Login ----------------*/
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');

    //Check if a token is present in the URL
    const urlParams = new URLSearchParams(window.location.search);
    let recoveryToken = urlParams.get('token');

    //If token exists, user is resetting their password
    if (recoveryToken) {
        loginButton.innerText = "Reset Password";

        showMessage(loginMessage, "Enter your registered email and a new password.", 'green');

        //Automatically open Account
        const accountIcon = document.getElementById('account-icon');
        if (accountIcon) {
            showSection(accountIcon, 11);
        }
    }

    /*Listener for the login button
    Submits the form data to the server.

    When login button clicked:
    - It prevents default form submission behavior
    - It collects the login form data using 'FormData' object
    - It sends the form data to 'Login' via POST request with 'loadASPFilePOST' function
 
    If the responds with login success:
    - A success message is displayed
    - A password recovery link is sent to the user's email
  
    If the responds with an error:
    - Error message is displayed in the login message section
    */
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault(); //Stop page from reloading

        const formData = new FormData(loginForm); //Get login form info

        if(formData) {

            if (recoveryToken) { //If token exists, verify it with the server
                formData.append('recoveryToken', recoveryToken); //Add the recovery token to the form data
            }

            const loginResponse = await loadASPFilePOST('http://localhost:5188/api/Auth/Login', formData);

            if (loginResponse.success === true) {

                if (recoveryToken) {

                    //Password was reset, user still needs to log in normally
                    showMessage(loginMessage, loginResponse.message, 'green');

                    //Remove recovery token from URL
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );

                    //Recovery is finished
                    recoveryToken = null;

                    //Change button back to regular login
                    loginButton.innerText = "Login";

                    //Clear password so user can log in with their new password
                    loginForm.querySelector('input[name="password"]').value = "";

                } else {

                    //Normal successful login
                    authenticationSuccess(loginResponse, loginMessage);
                }

            } else {
                //If error, text is red
                showMessage(loginMessage, loginResponse.message, 'red');
            }
        }
    });

    /* Handle login/register success */
    function authenticationSuccess(response, messageDiv) {
        showMessage(messageDiv, response.message, 'green'); //If success, message is green

        setTimeout(() => {
            const authenticationDiv = document.getElementById('authentication-div');
            authenticationDiv.style.display = "none";
            getAccountOrders(response.UserID);
        }, 1000);
    }

    /*---------------- Recovery ----------------*/
    const recoveryForm = document.getElementById('recovery-form');
    const recoveryButton = document.getElementById('recovery-button');
    const recoveryMessage = document.getElementById('recovery-message');

    /*Listener for the recovery button
    Submits the form data to the server.

    When recovery button clicked:
    - It prevents default form submission behavior
    - It collects the recovery form data using 'FormData' object
    - It sends the form data to 'Recovery' via POST request
 
    If the responds with recovery success:
    - A success message is displayed
    - A password recovery link is sent to the user's email
  
    If the responds with an error:
    - Error message is displayed in the recovery message section
    */
    recoveryButton.addEventListener('click', async (event) => {
        event.preventDefault(); //Stop page from reloading

        const formData = new FormData(recoveryForm);

        if(formData) {
            const recoveryResponse = await loadASPFilePOST('http://localhost:5188/api/Auth/Recovery', formData);

            if (recoveryResponse.success === true) {

                showMessage(recoveryMessage, recoveryResponse.message, 'green');

            } else {
                //If error, text is red
                showMessage(recoveryMessage, recoveryResponse.message, 'red');
            }
        }
    });

});