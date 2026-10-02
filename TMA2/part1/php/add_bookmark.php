<?php

/*

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will add a new bookmark in the database with the info provided in the form

Explanation:
- Validate and sanitize new bookmark info (title and URL)
- Query is executed to insert a new row into the 'bookmarks' table
- If query successfully adds a row (the bookmark was added) success message is returned
- If no rows are affected (no changes were made) message is returned indicating nothing occurred
- If the query fails error message will be shown
- Closes connection and outputs JSON response

Tutorials used:
-PHP FILTER_UNSAFE_RAW filter
https://www.w3schools.com/php/filter_unsafe_raw.asp
*/

session_start();

require 'database_connection_part1.php';  //Use the database_connection.php file for connection info

//Validate the input
$title = trim(strip_tags(filter_input(INPUT_POST, 'title', FILTER_UNSAFE_RAW)));
$url = trim(filter_input(INPUT_POST, 'url', FILTER_SANITIZE_URL));

//Response array
$response = [
    'success' => false,
    'message' => ''
];

//Query to insert the bookmark into the database
$query = "INSERT INTO bookmarks (user_id, url, title) 
            VALUES (?, ?, ?)";
$stmt = mysqli_prepare($connection, $query);

if ($stmt) {
    mysqli_stmt_bind_param($stmt, "iss", $_SESSION['user_id'], $url, $title); //Insert int (user_id, url string, title string)
    
    $insertSuccess = mysqli_stmt_execute($stmt);

     if ($insertSuccess) { //If insert was a success

        //Echo success response
         $response['success'] = true;
         $response['message'] = 'Bookmark added successfully';

    } else {
        $response['message'] = 'Could not add bookmark';
    }

    mysqli_stmt_close($stmt); //Close connection

} else {

    $response['message'] = 'Could not add bookmark'; //Error message

}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>