<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will fetch and all learning content units and return them after stored EML/XML content has been parsed into HTML

Explanation:
- Calls getUnits() inside unit_functions.php to retrieve all learning content units from the database
- getUnits() parses each unit's stored EML/XML content into HTML using parseEMLToHTML()
- Parsed content is stored in an array and returned to the client
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