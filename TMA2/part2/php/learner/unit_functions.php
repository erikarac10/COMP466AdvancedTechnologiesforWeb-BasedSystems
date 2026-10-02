<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This PHP file holds learner functions for progress, retrieval of units/media/questions, and EML/XML parsing for learner display
*/

require_once '../database_connection_part2.php';  //Use the database_connection.php fie for connection info

//Gets the user's progress (how many indexes of units they've completed)
//@param user_id - the ID of the user whose progress is being retrieved
function getUserProgress($connection, $user_id) {
    //Query to get user progress
    $query = "SELECT unit_progress FROM users WHERE user_id = ?";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_bind_param($stmt, "i", $user_id); 
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt); //Execute the prepared statement and get the result
        $row = mysqli_fetch_assoc($result);

        if ($row) {

            $progress = $row['unit_progress'];

            mysqli_stmt_close($stmt); //Close the prepared statement

            return $progress;
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
    return 0;
}

//Increment the user's course progress
//@param user_id - the ID of the user whose progress is being updated
function setUserProgress($connection, $user_id) {
    //Query to set user's progress
    $query = "UPDATE users SET unit_progress = unit_progress + 1 WHERE user_id = ?";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_bind_param($stmt, "i", $user_id);

        if (mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt); //Close the prepared statement
            return true;
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

                //Parse EML/XML retrieved from the database into HTML for the browser
                $row['unit_content'] = parseEMLToHTML($row['unit_content']);
            
                $unitContent[] = $row; //Enter the result inside of the array 
            }
            
            mysqli_stmt_close($stmt); //Close the prepared statement
            return $unitContent;
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
    return false;
}

//Parses EML/XML learning content retrieved from the database into HTML
//@param xmlString - the EML/XML learning content stored in the database
function parseEMLToHTML($xmlString) {

    $xml = new SimpleXMLElement($xmlString);

    $contentArray = []; //Array to store parsed HTML content

    foreach ($xml->content->children() as $element) { //Loop through each child of <content>

        if ($element->getName() == "header") { //If text was wrapped in <header>
            $contentArray[] = "<h3>" . htmlspecialchars((string)$element) . "</h3>"; //Replace these as h3's

        } elseif ($element->getName() == "text") { //If text was wrapped in <text>
            $contentArray[] = "<p>" . htmlspecialchars((string)$element) . "</p>"; //Replace these as p's

        } elseif ($element->getName() == "list") { //If text was wrapped in <list>

            $listArray = []; //Begin storing list items

            foreach ($element->children() as $item) { //For each element inside of the list
                if ($item->getName() == "item") { //If text was wrapped in <item>
                    $listArray[] = "<li>" . htmlspecialchars((string)$item) . "</li>"; //Replace these as li's
                }
            }

            $contentArray[] = "<ul>" . implode("\n", $listArray) . "</ul>"; //Wrap the list <li> items with <ul></ul>

        }
    }

    return implode("\n", $contentArray); //Convert array into a single formatted string
}

//Retrieves media content from the 'media' table
function getMedia($connection) {
    //Query to get media
    $query = "SELECT * FROM media ORDER BY unit_id ASC"; //order by ascending order
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
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
    return false;
}

//Retrieves all unit question data from the 'quiz_questions' table
function getQuestions($connection) {
    //Query to get all unit questions
    $query = "SELECT * FROM quiz_questions ORDER BY unit_id ASC"; //order by ascending order
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //Check if the statement preparation was successful
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt); //Execute the prepared statement and get the result

        if ($result) {
            //New array to hold results
            $quizContent = [];

            while ($row = mysqli_fetch_assoc($result)) {  //Loop through each row in the result set
                $quizContent[] = $row; //Enter the result inside of the array
            }
            
            mysqli_stmt_close($stmt); //Close the prepared statement
            return $quizContent;
        }
        mysqli_stmt_close($stmt); //Close the prepared statement
    }
    return false;
}

?>