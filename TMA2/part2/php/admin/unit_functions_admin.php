<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This PHP file holds administrator functions for unit, quiz, and media database operations, uploaded EML/XML processing and validation, and media validation

Tutorials used:
 - Custom error messages/get specific error messages
    https://www.php.net/manual/en/function.libxml-use-internal-errors.php
    https://www.php.net/manual/en/function.libxml-get-errors.php
*/

require_once '../database_connection_part2.php';  //Use the database_connection.php fie for connection info

//Gets the user's admin status
//@param user_id - the user id
function getAdminStatus($connection, $user_id) {
    //Query to get user's progress
    $query = "SELECT is_admin FROM users WHERE user_id = ?";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        
        $result = mysqli_stmt_get_result($stmt); //Execute the prepared statement and get the result
        $row = mysqli_fetch_assoc($result);

        if ($row) { //If there was a matching user
            
            mysqli_stmt_close($stmt); //Close the prepared statement
            return $row['is_admin']; //Return user's is_admin
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
    return false;
}

//Retrieves all unit data from the 'units' table
function getUnits($connection) {
    //Query to get all unit content
    $query = "SELECT * FROM units ORDER BY unit_id ASC"; //order by ascending order
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt); //Execute the prepared statement and get the result

        if ($result) {
            //New array to hold results
            $unitContent = [];

            while ($row = mysqli_fetch_assoc($result)) {  //Loop through each row in the result set
                $unitContent[] = $row; //Enter the result inside of the array
            }
            
            mysqli_stmt_close($stmt); //Close the prepared statement
            return $unitContent;
        }
    }
    return false;
}

//Replaces the contents of a unit in the 'units' table
//@param unit_id - the unit id of the course
//@param parsedXML - the parsed XML of the course being uploaded
function updateUnit($connection, $unit_id, $parsedXML) {
    //Query for updating a unit
    $query = "UPDATE units SET unit_title = ?, unit_content = ? WHERE unit_id = ?";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_bind_param($stmt, "ssi", $parsedXML['title'], $parsedXML['content'], $unit_id); //Bind parameters for the prepared statement
        $result = mysqli_stmt_execute($stmt); //Execute the prepared statement

        if ($result) { //Query executed successfully, even if the content was unchanged
            mysqli_stmt_close($stmt);
            return true;
        }
        mysqli_stmt_close($stmt);
    }
    return false;
}

//Adds a new unit to the database
//@param parsedXML - the parsed XML of the course being uploaded
function addUnit($connection, $parsedXML) {
    //Query for creating a unit
    $query = "INSERT INTO units (unit_title, unit_content) VALUES (?, ?)";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_bind_param($stmt, "ss", $parsedXML['title'], $parsedXML['content']); //Bind parameters for the prepared statement (unit title and content)
        $result = mysqli_stmt_execute($stmt); //Execute the prepared statement and get the result

        if ($result && mysqli_stmt_affected_rows($stmt) > 0) {  //Check if the execution was successful and a row was affected
            $unit_id = mysqli_insert_id($connection); //Get the ID of the last inserted unit
            mysqli_stmt_close($stmt); //Close the prepared statement
            return $unit_id; //Return the unit ID to use for adding questions
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
    return false;
}

//Adds a media file's contents to the database
//@param unit_id - the unit id of the course
//@param $parsedXML - the parsed XML of the course being uploaded
function addMedia($connection, $unit_id, $parsedXML) {

    if(isset($parsedXML['format'])) { //If format is not null (media exists)
        //Query to insert media file reference
        $query = "INSERT INTO media (unit_id, media_content, media_format) VALUES (?, ?, ?)";
        $stmt = mysqli_prepare($connection, $query);

        if ($stmt) {
            //Bind parameters unit_id (int) and media_content (BLOB)
            mysqli_stmt_bind_param($stmt, "iss", $unit_id, $parsedXML['media'], $parsedXML['format']);
            $result = mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            return $result; //Return true if successful
        }
    }
    return false;
}

//Add questions to a specific unit
//@param unit_id - the unit id of the course
//@param parsedXML - the parsed XML of the course being uploaded
function addQuestions($connection, $unit_id, $parsedXML) {
    //Insert into quiz_questions
    $query = "INSERT INTO quiz_questions (unit_id, question_text, answer_one, answer_two, answer_three, correct_answer) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful

        foreach ($parsedXML['questions'] as $question) { //Loop through the questions from the parsed XML data
            //Extract the question text and answer options
            $question_text = $question['text'];
            $answer_one = $question['answers'][0]['text'];
            $answer_two = $question['answers'][1]['text'];
            $answer_three = $question['answers'][2]['text'];

            //Find the correct answer by searching for the true value in the answers array
            $correct_answer = array_search(true, array_column($question['answers'], 'correct')) + 1;

            //Bind parameters for the prepared statement (unit_id, question, answers, and correct answer)
            mysqli_stmt_bind_param($stmt, "issssi", $unit_id, $question_text, $answer_one, $answer_two, $answer_three, $correct_answer);

            //Execute the prepared statement for the question
            $result = mysqli_stmt_execute($stmt);

            //Check if the question was not added successfully
            if (!$result || mysqli_stmt_affected_rows($stmt) <= 0) {
                //If the question failed to be inserted
                mysqli_stmt_close($stmt); //Close the prepared statement
                return false;
            }
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
        return true;
    } else {
        return false;
    }
}

//Delete a specific unit
//@param unit_id - the unit id of the course
function deleteUnit($connection, $unit_id) {
    //Query for deleting a unit
    $query = "DELETE FROM units WHERE unit_id = ?";
    $stmt = mysqli_prepare($connection, $query);
    
    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_bind_param($stmt, "i", $unit_id); //Bind parameters for the prepared statement
        $result = mysqli_stmt_execute($stmt); //Execute the prepared statement and get the result

        if ($result) {  //Check if the execution was successful
            mysqli_stmt_close($stmt); //Close the prepared statement
            return true;
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
     return false;
}

//Delete all questions from a specific unit
//@param unit_id - the unit id of the course
function deleteQuestions($connection, $unit_id) {
    //Delete all questions related to the unit being replaced
    $query = "DELETE FROM quiz_questions WHERE unit_id = ?";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_bind_param($stmt, "i", $unit_id); //Bind parameters for the prepared statement
        $result = mysqli_stmt_execute($stmt); //Execute the prepared statement and get the result

        if ($result && mysqli_stmt_affected_rows($stmt) > 0) {  //Check if the execution was successful and a row was affected
            mysqli_stmt_close($stmt); //Close the prepared statement
            return true;
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
    return false;
}

//Delete all media from a specific unit
//@param unit_id - the unit id of the course
function deleteMedia($connection, $unit_id) {
    //Delete all media related to the unit being replaced
    $query = "DELETE FROM media WHERE unit_id = ?";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_bind_param($stmt, "i", $unit_id); //Bind parameters for the prepared statement
        $result = mysqli_stmt_execute($stmt); //Execute the prepared statement and get the result

        if ($result) {  //Check if the execution was successful
            mysqli_stmt_close($stmt); //Close the prepared statement
            return true;
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
    return false;
}

/*  Will validate whether or not uploaded XML/EML file is in the correct format.
    If not in correct format, will return errors depending on missing content.
    If correct format, will process the XML and return categorized data:
        -title
        -content (original EML/XML string)
        -questions
        to be inserted into the database.
    The original EML/XML content is preserved in the database and will be parsed
    into HTML when retrieved for learner display.
    If encounters an error, will output the message what went wrong.
        @param xmlString - The string contents of the file
*/
function processUploadedEML($xmlString, $mediaFile) {

    libxml_use_internal_errors(true); //Use internal error handling

    try {

        $xml = new SimpleXMLElement($xmlString); //Load the XML string as a SimpleXMLElement

        $validateEML = validateEML($xml);
        if($validateEML['success'] == false) {
            return $validateEML;
        }
        $validateMedia = validateMedia($mediaFile);
        if($validateMedia['success'] == false && $validateMedia['message'] == 'Media file must be valid format') {
            return $validateMedia;
        }
        if($validateMedia['success'] == false && $validateMedia['message'] != 'No media file supplied') {
            return $validateMedia;
        }
        if(!isset($validateMedia['format'])) {
            //If format doesn't exist, make it null instead (no media file supplied)
            $validateMedia['format'] = null;
        }

        $title = (string) $xml->title; //Extract the title
        
        $content = $xmlString; //Store original EML/XML in the database. Will be parsed into HTML when retrieved

        $questions = []; //Array for holding questions and answers

        foreach ($xml->questions->question as $question) { //Go through each and get each question

            $questionText = (string) $question->text; //Make string

            $answers = []; //Array for holding answer options

            foreach ($question->answers->answer as $answer) { //Extract answers

                $answers[] = [ //Insert the text for the answer option and whether it was correct or not
                    'text' => (string) $answer,
                    'correct' =>  (string) $answer['correct'] === 'true' //The correct answer to the question will be marked as 'true'
                ];
            }

            $questions[] = [ //Insert the question into the array
                'text' => $questionText,
                'answers' => $answers
            ];
        }
        return [ //Return the parsed data as an array
            'success' => true,
            'title' => $title,
            'content' => $content,
            'questions' => $questions,
            'media' => $validateMedia['message'],
            'format' => $validateMedia['format']
        ];

    } catch (Exception $e) {
        //If any error occurs loading as SimpleXMLElement, return false
        $errors = libxml_get_errors(); //Check for XML parsing errors
        libxml_clear_errors(); //Clear the error buffer
        
        $errorMessages = [];
        foreach ($errors as $error) {
            $errorMessages[] = "<br>Line {$error->line}, Column {$error->column}: " . trim($error->message);
        }

        $errorMessages = "Your XML file has syntax errors. Please review the following issues: " . implode(' ', $errorMessages);
        
        return [
            'success' => false,
            'message' => $errorMessages
        ];
    }
}

//Will go through each tag and confirm whether they exist and are valid
//Returns appropriate message
//@param xml - the xml file uploaded
function validateEML($xml) {

    /* --Validation for missing elements/format --*/
    //Check if <title> element exists
    if (!isset($xml->title)) {
        return [
            'success' => false,
            'message' => 'Missing '. htmlspecialchars('<title>') . ' element in XML.'
        ];
    }

    //Check if <content> element exists
    if (!isset($xml->content)) {
        return [
            'success' => false,
            'message' => 'Missing '. htmlspecialchars('<content>') . ' element in XML.'
        ];
    }

    //Check if <questions> element exists
    if (!isset($xml->questions)) {
        return [
            'success' => false,
            'message' => 'Missing '. htmlspecialchars('<questions>') . ' element in XML.'
        ];
    }

    //Check each element within <content>
    $validTags = ['header', 'text', 'list', 'item'];
    foreach ($xml->content->children() as $element) {
        if (!in_array($element->getName(), $validTags)) { //If the tag isn't a valid EML tag
            //Throw error if tag wasn't one of the EML ones
            return [
                'success' => false,
                'message' => 'Unrecognized EML tag: ' . $element->getName() . '.<br>Valid tags are:<br>' . implode('<br>', array_map(function($tag) {
                    return htmlspecialchars('<' . $tag . '>');
                }, $validTags))
            ];
        }
    }

    //Check if at least 1 <question> element exists inside <questions>
    if (count($xml->questions->question) == 0) {
        return [
            'success' => false,
            'message' => 'No '. htmlspecialchars('<question>') . ' elements found inside <questions>.'
        ];
    }
 
    foreach ($xml->questions->question as $question) { //Go through each and get each question

        //Check if <answers> element exists inside <question>
        if (!isset($question->answers)) {
            return [
                'success' => false, 
                'message' => 'A '. htmlspecialchars('<question>') . ' is missing an ' . htmlspecialchars('<answers>') . ' element.'
            ];
        }

        //Check if <text> element exists inside <question>
        if (!isset($question->text)) {
            return [
                'success' => false, 
                'message' => 'A '. htmlspecialchars('<question>') . ' is missing a ' . htmlspecialchars('<text>') . ' element.'
            ];
        }

        //Check if there are exactly 3 <answer> elements inside <answers>
        if (count($question->answers->answer) != 3) {
            return [
                'success' => false, 
                'message' => 'Each '. htmlspecialchars('<answers>') . ' must contain exactly 3 ' . htmlspecialchars('<answer>') . ' elements.'
            ];
        }

        $correctAnswers = 0;
        foreach ($question->answers->answer as $answer) { //Go through each answer and get each option

            if((string) $answer['correct'] == 'true') {
                $correctAnswers++; //Count how many correct answers there were
            }
        }
        
        //Check if there is exactly 1 answer maked as correct
        $questionText = (string) $question->text;
        if ($correctAnswers != 1) {
            return [
                'success' => false, 
                'message' => 'Question ' . $questionText . ' must have exactly 1 correct answer.'
            ];
        }
    }

    return ['success' => true];
}

//Will check if the media file uploaded is a valid format
//@param mediaFile - the temporary path of the uploaded media file
function validateMedia($mediaFile) {

    if ($mediaFile && file_exists($mediaFile)) { //First check media image exists

        //Get the file info
        $fileInfo = getimagesize($mediaFile);
        $fileType = $fileInfo['mime'] ?? null; //Get the mime type
        $fileType = mime_content_type($mediaFile);  //Get the MIME type of the media file

        $allowedTypes = [ //Allowed media types
            'image/jpeg',
            'image/jpg',
            'image/png',
            'audio/mp3',
            'audio/mpeg',
            'video/mp4'
        ];

        //Check if file type is allowed
        if (in_array($fileType, $allowedTypes)) {
            return ['success' => true, 'message' => base64_encode(file_get_contents($mediaFile)), 'format' =>  $fileType]; //Return file content
        } else {
            return ['success' => false, 'message' => "Media file must be valid format. <br>Your uploaded format: " . $fileType]; //Return error message if not
        }
    }
    return ['success' => false, 'message' => "No media file supplied"];
}


?>