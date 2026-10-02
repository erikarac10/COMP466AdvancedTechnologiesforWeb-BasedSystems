<?php

/*
COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This PHP file will log the user out of the website by ending the session

Explanation:
- The session is resumed/started so current session is accessible
- All session variables are cleared using session_unset()
- The session itself is destroyed using session_destroy()
- After the session is destroyed, success is returned
- Exit statement to terminate

*/

$response = [
    'success' => false,
    'message' => ''
];


session_start(); //Resume/start session

//Remove all session variables
session_unset();

//Destroy the session
$sessionDestroyed = session_destroy();

// Check if the session was destroyed successfully
if ($sessionDestroyed) {
    $response['success'] = true;
    $response['message'] = "Logged out successfully";
    
//Redirect back to the login page
//header("Location: ../../tma2.htm");
} else {
    $response['message'] = "Unable to log out";
}

echo json_encode($response);
exit(); //Exit the php file

?>
