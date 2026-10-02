<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will fetch the user's unit progress

Explanation:
- Call getUserProgress() function inside of unit_functions.php to fetch all learning content quiz questions
- Fetched content is stored in response array and returned to client
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
    'progress' => ''
];

if($_SESSION['is_admin']) { //If is admin,
    $response['message'] = 'Is Admin'; //Don't lock units
} else {

    $user_id = $_SESSION['user_id'];

    //Make sure user is logged in by checking session variables
    if (isset($user_id)) {

        $userProgress = getUserProgress($connection, $user_id); //Get the user's progress

        if ($userProgress !== false) {
            //Echo success response
            $response['success'] = true;
            $response['message'] = "Retrieved user's progress successfully";
            $response['progress'] = $userProgress; //Return user's progress
        } else {
            //Error message
            $response['message'] = "Could not fetch user's progress";
        }

    } else {
        $response['message'] = 'Not logged in';
    }
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>