<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This PHP file deletes a unit and its associated quiz questions from the database

Explanation:
- Starts a session
- Validate the input received 
- Deletes the unit with the associated unit_id from 'units' table
- Deletes all related quiz questions from 'quiz_questions' table
- Returns a success message if deletion is successful
- If no unit_id is provided, an error message is returned instead
- Return a JSON response indicating success or error messages to the client
- Closes connection and outputs JSON response
*/
session_start();

require_once '../database_connection_part2.php';  //Use the database_connection.php fie for connection info
require_once 'unit_functions_admin.php'; //Include the admin functions file

//Response array
$response = [
    'success' => false,
    'message' => ''
];

//Check if the user is an admin
if (isset($_SESSION['is_admin']) && $_SESSION['is_admin'] == 1) {

    //Validate the input
    $unit_id = filter_input(INPUT_POST, 'unit_id', FILTER_VALIDATE_INT);

    if ($unit_id) { //If the unit_id exists

        if (deleteUnit($connection, $unit_id)) { //If the unit is successfully deleted
            if (deleteQuestions($connection, $unit_id)) { //If the questions are successfully deleted
                if(deleteMedia($connection, $unit_id)) { //Just incase delete cascade does not work
                    $response['success'] = true;
                    $response['message'] = 'Unit, questions, and media deleted successfully';
                }
            } else {
                $response['message'] = 'Failed to delete the unit questions';
            }
        } else {
            $response['message'] = 'Failed to delete the unit';
        }
    } else {
        $response['message'] = 'No unit selected';
    }
} else {
    //User is not an admin, show an error message
    $response['success'] = false;
    $response['message'] = 'You do not have permission to delete units';
}
//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>
