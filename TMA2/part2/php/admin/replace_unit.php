<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This PHP file replaces a unit and it's questions with an uploaded XML file

Explanation:
- Starts a session
- Validate the input received 
- Updates the unit with the associated unit_id from 'units' table
- Deletes all related quiz questions from 'quiz_questions' table
- Re-adds new unit questions since update will not address old questions if new questions list is shorter than the old
- Returns a success message if replacement/update is successful
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
    $xmlFile = $_FILES['xml-file']['tmp_name'] ?? null;
    $mediaFile = $_FILES['media-file']['tmp_name'] ?? null; //If media file is provided
    //Check media file size for live server database limit on infinity dash
    if (isset($_FILES['media-file']) &&
        $_FILES['media-file']['error'] == UPLOAD_ERR_OK &&
        $_FILES['media-file']['size'] > 2000000) {

        $response['message'] = 'Media file is too large. Please upload a media file smaller than 2 MB.';
        echo json_encode($response);
        mysqli_close($connection);
        exit();
    }
    $unit_id = filter_input(INPUT_POST, 'unit_id', FILTER_VALIDATE_INT);

    if(!$unit_id) { //If no unit id was retrieved
        $response['message'] = 'No unit selected';
        echo json_encode($response);
        exit();
    }

    if ($xmlFile && file_exists($xmlFile)) { //If the xmlfile is valid and exists
        $xmlString = file_get_contents($xmlFile); //Get the content of the XML file as a string
        $parsedXML = processUploadedEML($xmlString, $mediaFile); //Parse the XML string into an associative array, check media file

        if ($parsedXML['success']) { //Check if the XML was successfully parsed

            if (updateUnit($connection, $unit_id, $parsedXML)) { //Update the existing unit
                if (deleteQuestions($connection, $unit_id)) { //Delete old unit questions
                    if (addQuestions($connection, $unit_id, $parsedXML)) { //Add new questions for unit

                        $title = $parsedXML['title'] ?? 'Unknown Title';
                        $response['success'] = true;
                        $response['message'] = 'Unit updated and quiz questions replaced successfully. Unit: ' . $title;

                        if(deleteMedia($connection, $unit_id)) {
                            //Add media if it exists
                            if (!empty($parsedXML['format'])) {
                                if (addMedia($connection, $unit_id, $parsedXML)) {
                                    $response['message'] .= '<br>Media successfully added';
                                } else {
                                    $response['message'] .= '<br>Could not add media';
                                }
                            }
                        }
                    } else {
                        $response['message'] = 'Failed to add quiz questions';
                    }
                } else {
                    $response['message'] = 'Failed to delete old quiz questions';
                }
            } else {
                $response['message'] = 'Failed to update unit content';
            }
        } else {
            $response['message'] = $parsedXML['message'];
        }
    } else {
        $response['message'] = 'XML file does not exist or is not valid';
    }
} else {
    //User is not an admin, show an error message
    $response['success'] = false;
    $response['message'] = 'You do not have permission to upload files';
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>