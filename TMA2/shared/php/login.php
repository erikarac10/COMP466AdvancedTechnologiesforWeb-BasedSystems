<?php

session_start();

//require 'database_connection.php';  //Use the database_connection.php fie for connection info

//Debug array
$response = [
    'success' => false,
    'user_id' => 0,
    'message' => ''
];

//Choose the correct db connection based on db_context
$context = $_POST['db_context'] ?? '';

switch ($context) {
    case 'part1':
        require '../../part1/php/database_connection_part1.php';
        break;
    case 'part2':
        require '../../part2/php/database_connection_part2.php';
        break;
    default:
        http_response_code(400);
        $response['message'] = "Could not connect to database";
        echo json_encode($response);
        exit;
}
//Validate the input
$username = htmlspecialchars($_POST['username'] ?? '', ENT_QUOTES, 'UTF-8');
$password = htmlspecialchars($_POST['password'] ?? '', ENT_QUOTES, 'UTF-8');

//Make sure input fields are not empty
if (empty($username) || empty($password)) {
    $response['message'] = 'Username and password fields cannot be empty.';
} elseif (strlen($username) < 1 || strlen($username) > 20) {
    $response['message'] = 'Please enter a username between 1 - 20 characters.';
} elseif (strlen($password) < 1 || strlen($password) > 20) {
    $response['message'] = 'Please enter a password between 1 - 20 characters.';
} else {
    //Else, input was valid

    //Get the user_id and password of the user if their username
    $query = "SELECT user_id, password FROM users WHERE username = ?";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //If can establish connection
        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt); //Get the result of the query

        if (mysqli_stmt_num_rows($stmt) === 0) { //If there were no rows found with the username
            $response['message'] = 'Invalid username or password.'; //Tell user username wasn't right (don't specify whether username/password was wrong)
        } else {
            //Else, username was found

            //Bind the user_id and password variables
            mysqli_stmt_bind_result($stmt, $userId, $hashedPassword);
            mysqli_stmt_fetch($stmt); //Fetch the user_id

            //Verify the hashed password retrieval against the password entered in the text field
            if (password_verify($password, $hashedPassword)) { //If they match

                //Start session
                $_SESSION['user_id'] = $userId;  //Set the user ID with what was fetched
                $_SESSION['username'] = $username;

                //Echo success response
                $response['success'] = true;
                $response['message'] = 'Login successful! Redirecting...';
            } else { //Wrong password, but don't say individual field was wrong
                $response['message'] = 'Invalid username or password.';
            }
        }

        mysqli_stmt_close($stmt);
    } else {
        $response['message'] = 'Could not login.';
    }
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>
