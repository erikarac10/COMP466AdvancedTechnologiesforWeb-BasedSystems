<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will fetch and all learning content quiz questions

Explanation:
- Call getQuestions() function inside of unit_functions.php to fetch all learning content quiz questions
- Fetched content is stored in an array and returned to client
- If the query fails error message will be shown
- Closes connection and outputs JSON response
*/

require_once '../database_connection_part2.php';  //Use the database_connection.php fie for connection info
require_once 'unit_functions.php'; //Include the functions file

//Response array
$response = [
    'success' => false,
    'message' => '',
    'array' => []
];

$quizContent = getQuestions($connection); //Get the quiz

if ($quizContent !== false && !empty($quizContent)) {
        //Echo success response
        $response['success'] = true;
        $response['message'] = 'Retrieved all quiz content successfully';
        $response['array'] = $quizContent; //Return all quiz contents list
} else {
    //Error message
    $response['message'] = 'Could not fetch quiz content';
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>