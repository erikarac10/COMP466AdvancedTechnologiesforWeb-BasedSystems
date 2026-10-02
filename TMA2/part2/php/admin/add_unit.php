<?php

/*

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will add a new unit in the database with the info provided in the form

Explanation:
- Validate and sanitize new unit info
- Query is executed to insert a new row into the 'units' table
- If query successfully adds a row (the unit was added) success message is returned
- If no rows are affected or query fails, error message will be shown
- Closes connection and outputs JSON response

Tutorials used:
- Check file extension
https://www.php.net/manual/en/function.pathinfo.php
*/

session_start();

require_once '../database_connection_part2.php';  //Use the database_connection.php fie for connection info
require_once 'unit_functions_admin.php'; //Include the admin functions file

//Response array
$response = [
    'success' => false,
    'message' => '',
    'media' => ''
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

    if ($xmlFile && file_exists($xmlFile)) { //If the xmlfile is valid and exists

        $fileExtension = pathinfo($_FILES['xml-file']['name'], PATHINFO_EXTENSION);

        if (strtolower($fileExtension) !== 'xml') {

            $response['message'] = 'The uploaded file is not a valid XML file.';

        } else { //The XML file exists, proceed processing

            $xmlString = file_get_contents($xmlFile); //Get the content of the XML file as a string

            $parsedXML = processUploadedEML($xmlString, $mediaFile); //Process and validate the uploaded EML/XML and optional media

            if ($parsedXML['success']) { //Check if the uploaded EML/XML was successfully processed

                $unit_id = addUnit($connection, $parsedXML); //Add unit

                if ($unit_id) {

                    //Add questions
                    if (addQuestions($connection, $unit_id, $parsedXML)) {

                        $title = $parsedXML['title'] ?? 'Unknown Title';

                        $response['success'] = true;
                        $response['message'] = 'New unit and associated quiz added. Unit: ' . $title;

                        //Add media if it exists
                        if (!empty($parsedXML['format'])) {
                            if (addMedia($connection, $unit_id, $parsedXML)) {
                                $response['message'] .= '<br>Media successfully added';
                            } else {
                                $response['message'] .= '<br>Could not add media';
                            }
                        }

                    } else {
                        $response['message'] = 'Failed to add quiz questions';
                    }

                } else {
                    $response['message'] = 'Failed to add unit content';
                }

            } else { //Output where processing failed
                $response['message'] = $parsedXML['message'];
            }
        }

    } else {

        if (ini_get('upload_max_filesize') || ini_get('post_max_size')) {
            $response['message'] = 'The max upload filesize is: ' . ini_get('upload_max_filesize') . '<br>The max post filesize is: ' . ini_get('post_max_size');
        } else {
            $response['message'] = 'No selected XML file or is not valid.';
        }
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