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

    //Check if username already exists
    $query = "SELECT user_id FROM users WHERE username = ?";
    $stmt = mysqli_prepare($connection, $query);

    if ($stmt) { //If can establish connection
        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt); //Get the result of the query

        if (mysqli_stmt_num_rows($stmt) > 0) { //If there was a row found with a username
            $response['message'] = 'Username already exists.'; //Tell user to pick a new username
        } else {
            //Else, not a duplicate, create a new user
            $query = "INSERT INTO users (username, password) VALUES (?, ?)";
            $stmt = mysqli_prepare($connection, $query); //New connection with new query

            if ($stmt) { //If can establish connection
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT); //Hash their password for security
                mysqli_stmt_bind_param($stmt, "ss", $username, $hashedPassword); //Insert their username and new password
                $insertSuccess = mysqli_stmt_execute($stmt);

                if ($insertSuccess) { //If it was able to insert

                    //Start session
                    $_SESSION['user_id'] = mysqli_insert_id($connection);  //Get the last inserted ID (auto-incremented)
                    $_SESSION['username'] = $username;

                    //Echo success response
                    $response['success'] = true;
                    $response['user_id'] = mysqli_insert_id($connection);
                    $response['message'] = 'Registration successful! Redirecting...';
                } else {
                    $response['message'] = 'Could not create user.';
                }
            } else {
                //Remove debug statements with general
                $response['message'] = 'Could not create user.';
            }
        }

        mysqli_stmt_close($stmt);
    } else {
        $response['message'] = 'Could not create user.';
    }
}

//Close the database connection
mysqli_close($connection);

//Output the response as JSON
echo json_encode($response);

?>
