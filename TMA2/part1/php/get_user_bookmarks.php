<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will fetch and return the user's saved bookmarks

Explanation:
- Starts a session
- If the user is not logged in, a message is returned indicating that they are not logged in
- Query is executed to fetch all bookmarks belonging to the user from the 'bookmarks' table, ordered by bookmark ID in descending order
- Fetched bookmarks are stored in an array and returned to client
- If the query fails error message will be shown
- Closes connection and outputs JSON response
*/

session_start();

require 'database_connection_part1.php';  //Use the database_connection.php file for connection info

//Response array
$response = [
    'success' => false,
    'message' => '',
    'array' => []
];

//Check if the user is logged in
if (empty($_SESSION['user_id'])) {

    $response['message'] = 'Not Logged In';

    echo json_encode($response);

    exit();
}

//Query to get all of the users bookmarks
$query = "SELECT * FROM bookmarks 
            WHERE user_id = ?
            ORDER BY bookmarks.bookmark_id DESC";
$stmt = mysqli_prepare($connection, $query);

if ($stmt) { //If connection worked
    mysqli_stmt_bind_param($stmt, "i", $_SESSION['user_id']); //Bind parameter user's id
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    //New array to hold results
    $bookmarks = [];

    while ($row = mysqli_fetch_assoc($result)) {  //Loop through each row in the result set
        $bookmarks[] = $row; //Enter the result inside of the array
    }

    mysqli_stmt_close($stmt); //Close connection

    //Echo success response
    $response['success'] = true;
    $response['message'] = $_SESSION['username']; //Return user's username
    $response['array'] = $bookmarks; //Return popular bookmarks list

} else {
    
    $response['message'] = 'Could not fetch bookmarks.'; //Error message

}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>