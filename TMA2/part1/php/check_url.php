<?php

/*

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This PHP file checks if a URL submitted by the user is active

Explanation:
- Gets the URL sent from JavaScript
- Checks if the URL is in a valid format
- Uses cURL to attempt to connect to the website
- Follows redirects if the website redirects somewhere else
- Gets the HTTP status code returned by the website
- If the website returns a successful or redirect status, the URL is considered active
- Returns the result as a JSON response back to JavaScript

Tutorials used:
- PHP cURL
https://www.php.net/manual/en/book.curl.php

- HTML status codes
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status

*/

header('Content-Type: application/json'); //Return response as JSON

$url = $_GET['url'] ?? ''; //Get URL sent from JavaScript

//Response array
$response = [
    'active' => false,
    'status' => 0
];

//Check if the URL is in a valid format
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode($response);
    exit();
}

//Start cURL using the submitted URL
$curl = curl_init($url);

//Set cURL options
curl_setopt($curl, CURLOPT_NOBODY, true); //Only retrieve the response headers
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true); //Return response instead of outputting it
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true); //Follow website redirects
curl_setopt($curl, CURLOPT_TIMEOUT, 10); //Stop request if it takes longer than 10 seconds
curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0'); //Identify request as a browser

//Attempt to connect to the URL
curl_exec($curl);

//Get the HTTP response status code
$statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

//Close cURL
curl_close($curl);

//Store returned status code
$response['status'] = $statusCode;

/*Status codes from 200-399 mean the website responded successfully or redirected
if ($statusCode >= 200 && $statusCode < 400) {
    $response['active'] = true;
} */

/*Website is active if:
 responds successfully
 redirects
 or blocks request even though still clearly existing */
if (($statusCode >= 200 && $statusCode < 400) ||
    $statusCode == 401 ||
    $statusCode == 403 ||
    $statusCode == 405 ||
    $statusCode == 429) {

    $response['active'] = true;
}

//Output response as JSON
echo json_encode($response);

?>