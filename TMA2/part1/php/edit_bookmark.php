<?php

/*

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will attempt to edit an existing bookmark in the database with the info provided in the edit form

Explanation:
- Validate and sanitize bookmark info (id, title, url)
- Query is executed to update appropriate bookmark in the 'bookmarks' table
- If query successfully affects a row (the bookmark was updated) success message is returned
- If no rows are affected (no changes were made) message is returned indicating no update occurred
- If the query fails error message will be shown
- Closes connection and outputs JSON response
*/

require 'database_connection_part1.php';  //Use the database_connection.php file for connection info

//Validate the input
$bookmark_id = filter_input(INPUT_POST, 'bookmark_id', FILTER_VALIDATE_INT);
$title = trim(strip_tags(filter_input(INPUT_POST, 'title', FILTER_UNSAFE_RAW)));
$url = trim(filter_input(INPUT_POST, 'url', FILTER_SANITIZE_URL));

//Response array
$response = [
    'success' => false,
    'message' => ''
];

//Query to edit a specific bookmark
$query = "UPDATE bookmarks 
            SET title = ?, url = ? 
            WHERE bookmark_id = ?";
$stmt = mysqli_prepare($connection, $query);

if ($stmt) {

    mysqli_stmt_bind_param($stmt, 'ssi', $title, $url, $bookmark_id); //Update where the bookmark matches, edit title and url

    $result = mysqli_stmt_execute($stmt); //Get result of execution

    if ($result && mysqli_stmt_affected_rows($stmt) > 0) { //If there was a row affected and result exists

        //Echo success response
        $response['success'] = true;
        $response['message'] = 'Bookmark updated successfully!';

    } else {

        //$response['message'] = 'bookmark_id: ' . $bookmark_id . ' title: ' . $title . ' url: ' . $url;
        $response['message'] = 'No changes were made for this bookmark';

    }

    mysqli_stmt_close($stmt); //Close connection

} else {

    $response['message'] = 'Could not edit bookmark'; //Error message

}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);
?>
