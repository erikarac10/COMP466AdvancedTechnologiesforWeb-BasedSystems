<?php

/*

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will attempt to delete an existing bookmark in the database with the bookmark id provided in the form

Explanation:
- Validate and sanitize bookmark info (id)
- Query is executed to find and delete matching row in the 'bookmarks' table
- If query successfully affects a row (the bookmark was deleted) success message is returned
- If no rows are affected (no changes were made) message is returned indicating nothing occurred
- If the query fails error message will be shown
- Closes connection and outputs JSON response
*/

session_start();

require 'database_connection_part1.php';  //Use the database_connection.php file for connection info

//Validate the input
$bookmark_id = filter_input(INPUT_POST, 'bookmark_id', FILTER_VALIDATE_INT);

//Response array
$response = [
    'success' => false,
    'message' => ''
];

//Query for deleting a specific bookmark
$query = "DELETE FROM bookmarks 
            WHERE bookmark_id = ? 
            AND user_id = ?";
$stmt = mysqli_prepare($connection, $query);

if ($stmt) {

    mysqli_stmt_bind_param($stmt, "ii", $bookmark_id, $_SESSION['user_id']); //Bind bookmark_id and user_id

    $result = mysqli_stmt_execute($stmt);

    //Check if any rows were affected
    if ($result && mysqli_stmt_affected_rows($stmt) > 0) { //If there was a row deleted

        //Echo success response
        $response['success'] = true;
        $response['message'] = 'Bookmark deleted successfully';

    } else {
        //$response['message'] = 'No bookmark found/change made for bookmark ID: ' . $bookmark_id;
        $response['message'] = 'Could not find bookmark to delete';
    }

    mysqli_stmt_close($stmt); //Close connection

} else {

    $response['message'] = 'Could not delete bookmark'; //Error message
    
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);
?>
