/* 

COMP 466 Web-Based Systems
TMA 2

Erika Racette ID:  

This is the javascript file used for part2 online learning app (learner)

*/

/* Fetches and displays all learning content onto the web app
 
This function calls the 'loadPHPFileGET' function to send a GET request to the
'get_units.php' file. It processes the response to dynamically populate
the links and unit divs with the fetched data
 
If the fetch is successful:
- It gets all quiz content using getQuizzes()
- If getQuizzes() was successful, setup unit contents by running setupLearningContent():
    - Will check if the unit has any media content to append
    - It iterates over the list of units returned
    - Attach any media if any
    - For each unit it creates a clickable list item with the title
    - The list items are appended to the nav bar and divs are appended to the main-content-div
 
If the fetch fails:
- An error message is displayed in the main general content message
*/
async function getUnits(is_admin) {

    const learningResponse = await loadPHPFileGET('php/learner/get_units.php'); //Use the response of the php file 'get_units.php'
    //console.log("learningResponse: ", learningResponse);

    //If was response successful...
    if (learningResponse.success === true) {

        getQuizzes(learningResponse); //...Fetch the current quizzes available

    } else { //Couldn't get the units
        showMessage(message, learningResponse.message, 'red'); //List error message
    }

    if (is_admin === 1) {
        populateAdminUnits(learningResponse);
    }
}

async function getQuizzes(learningResponse) {

    const quizResponse = await loadPHPFileGET('php/learner/get_quizzes.php'); //Use the response of the php file 'get_quizzes.php'
    //console.log("quizResponse: ", quizResponse);

    //If was response successful...
    if (quizResponse.success === true) {
        setupLearningContent(learningResponse, quizResponse); //Both fetches were successful, setup content for learning app
    } else { //Couldn't get the unit quizzes
        showMessage(message, quizResponse.message, 'red'); //List error message
    }
}

async function getMedia() {
    //--------Add media content if any----------
    const mediaResponse = await loadPHPFileGET('php/learner/get_media.php'); //POST request
    //console.log("mediaResponse: ", mediaResponse);
    return mediaResponse.media;
}

const unitLinkDiv = document.getElementById('unit-links'); //Get the unit link div
const quizDiv = document.getElementById('unit-quiz-div');
async function setupLearningContent(learningResponse, quizResponse) {

    const mediaArray = await getMedia(); //Get media for all units
    //console.log("mediaArray: ", mediaArray);

    //For each item in the parsed data array
    learningResponse.array.forEach((unit) => {

        //--------Create a nav bar item----------
        const navBarLink = document.createElement('a');
        navBarLink.href = "#";
        navBarLink.id = 'unit-' + unit.unit_id; //Link sections.length
        navBarLink.setAttribute('data-index', unit.unit_id);  //Use a data attribute to store the index
        showMessage(navBarLink, unit.unit_title); //Set the content of the link
        unitLinkDiv.appendChild(navBarLink); //Append the link to the unit navbar div

        //--------Create a div----------
        const divContent = document.createElement('div');
        divContent.id = 'div-' + unit.unit_id; //div id is current div length
        showMessage(divContent, unit.unit_content); //Set the content of the div made to the unit content

        //--------Add media to div----------
        const mediaItem = mediaArray.find(media => media.unit_id === unit.unit_id);

        if (mediaItem) { //If there is a media item for this unit
            //console.log("mediaItem: ", mediaItem);
            //console.log("media content: ", mediaItem.media_content);

            let mediaContent;

            //Get MIME type from media format
            const mediaFormat = mediaItem.media_format;
            //console.log("mediaFormat: " + mediaFormat);

            //Check for image types (JPG, JPEG, PNG)
            if (mediaFormat === 'image/jpg' || mediaFormat === 'image/jpeg' || mediaFormat === 'image/png') {
                mediaContent = document.createElement('img');
                mediaContent.src = "data:" + mediaFormat + ";base64," + mediaItem.media_content;
                mediaContent.className = "media";
                mediaContent.id = 'media-' + mediaItem.unit_id;
                mediaContent.alt = "Unit media";
                //console.log("Image");
            }
            //Check for audio types (MP3)
            else if (mediaFormat === 'audio/mp3' || mediaFormat === 'audio/mpeg') {
                mediaContent = document.createElement('audio');
                mediaContent.src = "data:" + mediaFormat + ";base64," + mediaItem.media_content;
                mediaContent.className = "media";
                mediaContent.id = 'media-' + mediaItem.unit_id;
                mediaContent.controls = true; //Add controls for audio playback
                mediaContent.alt = "Audio media";
                //console.log("Audio");
            }
            //Check for video types (MP4)
            else if (mediaFormat === 'video/mp4') {
                mediaContent = document.createElement('video');
                mediaContent.src = "data:" + mediaFormat + ";base64," + mediaItem.media_content;
                mediaContent.className = "media";
                mediaContent.id = 'media-' + mediaItem.unit_id;
                mediaContent.controls = true; //Add controls for video playback
                mediaContent.alt = "Video media";
                //console.log("Video");
            }
            else { //Unsupported format
                return; //Do nothing
            }
            divContent.appendChild(mediaContent); //Append the media element to the content
        }

        //--------Create the quiz button----------        
        divContent.appendChild(document.createElement('br'));//Line break
        const quizButton = document.createElement('button');
        quizButton.className = "quiz-button"; //Give quiz button its own style
        showMessage(quizButton, unit.unit_title + ' Quiz'); //Title of unit is button text
        divContent.appendChild(quizButton); //Add button to the div

        //--------Create a listener for the button----------
        quizButton.addEventListener('click', (event) => {
            event.preventDefault();
            quizButton.style.display = "none"; //Hide button while quiz is open
            
            resetQuizContent(); //Clear existing quiz content
            setupQuiz(quizResponse, unit.unit_id); //Setup quiz div with quiz content
            quizDiv.style.display = "flex"; //Show quiz div
            
            //Scroll down slightly to show user the quiz
            setTimeout(() => {
                window.scrollBy({
                    top: 300,
                    behavior: 'smooth'
                });
            }, 100);
        });

        //--------Reset nav bar links and sections with the uploaded units----------
        unitContentDiv.appendChild(divContent); //Add new section to main
    });
    setupNavBarUnits();
    lockUnits(); //Lock units based on user's progress
}

//Retrieve unit quiz div id's
const quizContent = document.getElementById('unit-quiz-content');
const quizMessage = document.getElementById('quiz-message');
const quizResults = document.getElementById('quiz-results');
const userResults = document.getElementById('user-results');
function resetQuizContent() { //Reset existing quiz content
    unitQuizDiv.style.display = "none";
    showMessage(quizContent, "");
    showMessage(quizMessage, "");
    quizResults.style.display = "none";
    showMessage(userResults, "");
}

//Fetch and create action listener for the general quiz's submit button
const submitBtn = document.getElementById('submit-btn');

/* Set the content of the unit quiz
- Filters questions based on the unit ID
- Dynamically generates quiz contents with each answer choice

@param quizResponse - Quiz data containing the questions from getQuizzes()
@param unitID - The ID of the unit for the associated quiz
*/
async function setupQuiz(quizResponse, unitID) {

    //Filter the quizzes where the unit_id matches the index
    const matchingQuizzes = quizResponse.array.filter(quiz => quiz.unit_id === unitID);

    submitBtn.value = unitID; //Value of submit button is the unitID

    //For each question related to the unit
    matchingQuizzes.forEach((question, unitID) => {

        //--------Create a div for each question----------
        const questionDiv = document.createElement('div');
        questionDiv.className = "question";
        quizContent.appendChild(questionDiv);

        //--------Display the question text----------
        const questionText = document.createElement('b');
        showMessage(questionText, (unitID + 1) + ". " + question.question_text);
        questionDiv.appendChild(questionText);

        questionDiv.appendChild(document.createElement('br'));//Line break
        questionDiv.appendChild(document.createElement('br'));//Line break

        //--------Create a radio button for each answer option----------

        //Answer One
        const row1 = document.createElement('div'); //Create row container for radio+label
        row1.className = "row";
        const answerOneRadio = document.createElement('input');
        answerOneRadio.className ="radio";
        answerOneRadio.type = 'radio';
        answerOneRadio.name = 'q' + unitID;  //Unique name for each question
        answerOneRadio.value = (1 === question.correct_answer) ? 'true' : 'false';  //Check if it's the correct answer
        //--Create the label for the answer option--
        const answerOneLabel = document.createElement('label');
        showMessage(answerOneLabel, question.answer_one);
        row1.appendChild(answerOneRadio);
        row1.appendChild(answerOneLabel);
        questionDiv.appendChild(row1);

        questionDiv.appendChild(document.createElement('br'));//Line break
        questionDiv.appendChild(document.createElement('br'));//Line break

        //Answer Two
        const row2 = document.createElement('div'); //Create row container for radio+label
        row2.className = "row";
        const answerTwoRadio = document.createElement('input');
        answerTwoRadio.className = "radio";
        answerTwoRadio.type = 'radio';
        answerTwoRadio.name = 'q' + unitID;  //Same name for the question
        answerTwoRadio.value = (2 === question.correct_answer) ? 'true' : 'false';  //Check if it's the correct answer
        //--Create the label for the answer option--
        const answerTwoLabel = document.createElement('label');
        showMessage(answerTwoLabel, question.answer_two);
        row2.appendChild(answerTwoRadio);
        row2.appendChild(answerTwoLabel);
        questionDiv.appendChild(row2);

        questionDiv.appendChild(document.createElement('br'));//Line break
        questionDiv.appendChild(document.createElement('br'));//Line break

        //Answer Three
        const row3 = document.createElement('div'); //Create row container for radio+label
        row3.className = "row";
        const answerThreeRadio = document.createElement('input');
        answerThreeRadio.className = "radio";
        answerThreeRadio.type = 'radio';
        answerThreeRadio.name = 'q' + unitID;
        answerThreeRadio.value = (3 === question.correct_answer) ? 'true' : 'false';  //Check if it's the correct answer
        //--Create the label for the answer option--
        const answerThreeLabel = document.createElement('label');
        showMessage(answerThreeLabel, question.answer_three);
        row3.appendChild(answerThreeRadio);
        row3.appendChild(answerThreeLabel);
        questionDiv.appendChild(row3);

        questionDiv.appendChild(document.createElement('br'));//Line break
        questionDiv.appendChild(document.createElement('br'));//Line break
    });
}

/* Event listener for Submit button
- Evaluates the user's quiz responses and displays the results/corrections OR prompts for missing answers
*/
submitBtn.addEventListener('click', async () => {
    let score = 0; //Add up user's score
    let quizMessageHTML = ''; //Message variable for notifications
    let quizResultsHTML = ''; //User's quiz results
    let unansweredQuestion = false; //Check if there are any unanswered questions

    //Select all question divs
    const allQuestionDivs = quizContent.querySelectorAll('.question');

    //Loop through each question div
    allQuestionDivs.forEach((questionDiv) => { //For each question

        const selectedAnswer = questionDiv.querySelector('input[type="radio"]:checked'); //Get the selected radio button
        const questionText = questionDiv.querySelector('b').textContent; //Get the question text
        const correctAnswer = questionDiv.querySelector('input[type="radio"][value="true"]'); //Get the radio button that is the answer (value=true)
        const correctAnswerLabel = correctAnswer.nextElementSibling; //Get label next to radio

        if (selectedAnswer && (selectedAnswer.value == correctAnswer.value)) { //If the radio selected was true
            score++; //Add to the user's score
        } else if (correctAnswerLabel && selectedAnswer && (selectedAnswer.value != correctAnswer.value)) { //If the radio was selected was not correct, add to the message html
            quizMessageHTML += "Question: " + questionText + "<br><span style='color:red;'>Incorrect. The correct answer was: " + correctAnswerLabel.textContent + "</span><br><br>";
        } else { //Else, nothing was selected
            unansweredQuestion = true; //Mark this question as unanswered
        }
    });

    if (unansweredQuestion == true) { //If there was an unanswered question
        quizMessageHTML = "Please answer all questions"; //Notify user to answer all of them
        showMessage(quizMessage, quizMessageHTML, "red");
    } else { //Else, tally up user's score
        let userScore = Math.round((score / allQuestionDivs.length) * 100);
        quizResultsHTML = "You scored " + score + " out of " + allQuestionDivs.length + " (" + userScore + "%)";
        quizResults.style.display = "block";
        showMessage(quizMessage, quizMessageHTML, "black");
        showMessage(userResults, quizResultsHTML);
        unlockNextUnit(submitBtn.value); //Update the user's progress
    }

    window.scrollTo(0, document.body.scrollHeight); //Scroll to bottom

});

/* Fetches the progress of the user and locks units based on the user's progress
 
This function calls the 'loadPHPFileGET' function to send a GET request to the
'get_user_progress.php' file. It processes the response to dynamically lock (disable clicking and greying out)
links with the fetched data
 
If the fetch is successful:
- It loops through all navbar links
- It locks the navbar link <a> if the user's progress int is smaller than the link's index
 
If the fetch fails:
- All units are left unlocked to unrestrict learning
*/
async function lockUnits() {
    const lockResponse = await loadPHPFileGET('php/learner/get_user_progress.php'); //Use the response of the php file 'get_user_progress.php'
    //console.log("lockResponse: " + JSON.stringify(lockResponse));

    //If the response was successful and lockResponse.progress is a valid integer
    if (lockResponse.success === true && Number.isInteger(lockResponse.progress)) {

        const progress = lockResponse.progress; //Integer represents user's progress level
        //Loop through all unit links (Nav Links higher than 5)
        unitLinks.forEach((unitLink, index) => {
            if (progress < index) { //If progress is less than the index
                
                unitLink.classList.add("locked-unit"); //Disable the link by adding the class style 'locked-unit'
            }
        });
    } //else { //If the response is not successful or progress is not integer
    //Does not really matter, still allow user to learn
    //}
}

/* Unlock the very next locked unit
- Analyses the current quiz button value
- Looks at the next nav-bar link data-index
- Compared the recently completed quiz value with the next nav-bar link data-index
- If the the next nav-bar link data-index is the very next number after the recently completed quiz value, 
    - Remove the lock and update the user's progress with updateUserProgress()
*/
async function unlockNextUnit() {

    //Loop through all unit links
    for (let i = 0; i < unitLinks.length; i++) {

        if (unitLinks[i].classList.contains('locked-unit')) { //When the first locked-unit is encountered
            unitLinks[i].classList.remove("locked-unit"); //Remove it as a locked unit
            updateUserProgress();
            return; //Exit function
        }
    }
}

/* Updates the user's progress in the database after they complete a unit or quiz
 
This function calls the 'loadPHPFileGET' function to send a GET request to the
'set_user_progress.php' file. It processes the response to update the user's progress in the database
 
If the update is successful:
- Does not notify user
 
If the fetch fails:
- Notify user their progress could not be saved
*/
async function updateUserProgress() {
    const updateResponse = await loadPHPFileGET('php/learner/set_user_progress.php'); //Use the response of the php file
    //console.log("updateResponse: " + JSON.stringify(updateResponse));

    //If the response was not successful, notify user
    if (updateResponse.success === false) {
        showMessage(message, updateResponse.message);
    }
}
