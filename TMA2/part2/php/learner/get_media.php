<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will fetch and all learning content media

Explanation:
- Call getMedia() function inside of unit_functions.php to fetch learning content media
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
    'media' => []
];

$getMedia = getMedia($connection); //Get all media content

if ($getMedia !== false) {

    if (!empty($getMedia)) {
        //Prepare an array to hold the encoded media content
        $encodedMedia = [];

        //Loop through each media item and base64 encode the 'media_content'
        foreach ($getMedia as $mediaItem) {
            $encodedMedia[] = [
                'unit_id' => $mediaItem['unit_id'],
                'media_format' => $mediaItem['media_format'],
                'media_content' => $mediaItem['media_content']
            ];
        }

        //Set the response
        $response['success'] = true;
        $response['message'] = 'Retrieved all unit media successfully';
        $response['media'] = $encodedMedia; //Include the encoded media
    } else {
        $response['message'] = 'No media in database';
    }
} else {
    //Error message
    $response['message'] = 'Could not fetch media content';
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>