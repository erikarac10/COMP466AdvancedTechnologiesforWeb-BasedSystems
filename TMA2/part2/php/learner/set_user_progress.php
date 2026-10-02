<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will set the user's unit progress

Explanation:
- Call setUserProgress() function inside of unit_functions.php to increment the user's progress value
- Status of update is stored in response array and returned to client
- If the query fails error message will be shown
- Closes connection and outputs JSON response
*/

session_start();

require_once '../database_connection_part2.php';  //Use the database_connection.php fie for connection info
require_once 'unit_functions.php'; //Include the functions file

//Response array
$response = [
    'success' => false,
    'message' => '',
];

$user_id = $_SESSION['user_id'];

//Make sure user is logged in by checking session variables
if (isset($user_id)) {

    if (setUserProgress($connection, $user_id)) { //If setting the user's progress returns true
        //Echo success response
        $response['success'] = true;
        $response['message'] = 'Progress updated successfully';
    } else {
        //Error message
        $response['message'] = 'Could not update your progress';
    }
} else {
    $response['message'] = 'Not logged in';
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>