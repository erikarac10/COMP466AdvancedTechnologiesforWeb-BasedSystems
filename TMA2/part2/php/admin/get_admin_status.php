<?php

/*

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will fetch and return the user's admin status

Explanation:
- Check if the user is logged in by checking session user_id variable
- Retrieve the session admin variable
- If the user is logged in, the admin status (is_admin) from the session is returned
- If the user is not logged in, message is returned indicating that they are not logged in
- Closes connection and outputs JSON response

Tutorials used:
-PHP FILTER_UNSAFE_RAW filter
https://www.w3schools.com/php/filter_unsafe_raw.asp
*/

session_start();

require_once '../database_connection_part2.php';  //Use the database_connection.php fie for connection info
require 'unit_functions_admin.php';

//Response array
$response = [
    'success' => false,
    'message' => '',
    'is_admin' => 0 //Default to not admin
];

//Check if the user is logged in
if (empty($_SESSION['user_id'])) {

    $response['message'] = 'Not logged in';

} else {
    //If logged in, return the admin status from the session
    $response['success'] = true;
    $_SESSION['is_admin'] = getAdminStatus($connection, $_SESSION['user_id']); //Set session variable
    $response['is_admin'] = $_SESSION['is_admin'];
}

//Output the response as JSON
echo json_encode($response);

?>