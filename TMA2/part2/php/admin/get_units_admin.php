<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will fetch and all learning content units

Explanation:
- Call getUnits() function inside of unit_functions_admin.php to fetch all learning content units
- Fetched content is stored in an array and returned to client
- If the query fails error message will be shown
- Closes connection and outputs JSON response
*/

require_once '../database_connection_part2.php';  //Use the database_connection.php fie for connection info
require_once 'unit_functions_admin.php'; //Include the functions file

//Response array
$response = [
    'success' => false,
    'message' => '',
    'array' => []
];

$unitContent = getUnits($connection); //Get the units

if ($unitContent !== false) {
    if (!empty($unitContent)) {
        //Echo success response
        $response['success'] = true;
        $response['message'] = 'Retrieved all unit content successfully';
        $response['array'] = $unitContent; //Return all unit contents list
    } else {
        $response['message'] = 'No units in online learning management app yet'; //No units in database currently
    }

} else {
    //Error message
    $response['message'] = 'Could not fetch unit content';
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>