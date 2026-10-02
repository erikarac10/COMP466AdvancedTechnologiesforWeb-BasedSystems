<?php

/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file will fetch and return the 10 most popular bookmarks

Explanation:
- Query is executed to fetch all bookmarks from the 'bookmarks' table, ordered by occurrences of each combination
- Fetched bookmarks are stored in an array and returned to client
- If the query fails error message will be shown
- Closes connection and outputs JSON response
*/

require 'database_connection_part1.php';  //Use the database_connection.php file for connection info

//Response array
$response = [
    'success' => false,
    'message' => '',
    'array' => []
];

//Query to get the 10 most popular / top bookmarks, by url+title
$query = "SELECT url, COUNT(*) AS count
            FROM bookmarks
            GROUP BY url
            ORDER BY count DESC
            LIMIT 10";
$stmt = mysqli_prepare($connection, $query);

if ($stmt) { //If connection worked
    mysqli_stmt_execute($stmt); //Execute
    $result = mysqli_stmt_get_result($stmt); //Get the results

    //New array to hold results
    $bookmarks = [];

    while ($row = mysqli_fetch_assoc($result)) { //Loop through each row in the result set
        $bookmarks[] = $row; //Enter the result inside of the array
    }

    mysqli_stmt_close($stmt); //Close connection

    //Echo success response
    $response['success'] = true;
    $response['message'] = 'Top bookmarks fetched successfully.';
    $response['array'] = $bookmarks; //Return popular bookmarks list

} else {

    $response['message'] = 'Could not fetch top bookmarks.'; //Error message
    
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>
