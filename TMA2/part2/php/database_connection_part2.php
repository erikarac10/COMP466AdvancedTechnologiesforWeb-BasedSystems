<?php
/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This php file stores the database connection information

*/

//Setup the credentials for the database connection
$host = 'localhost'; //virtual server
$database   = 'online_learning_database'; //name of database
$user = 'root'; //database username
$password = ''; //database password

//Create the connection to the MySQL database
$connection = mysqli_connect($host, $user, $password, $database);

//If there was a connection error
if (mysqli_connect_errno()) {
    
    //Log the error message
    error_log("Database connection error: " . mysqli_connect_error());
}

?>
