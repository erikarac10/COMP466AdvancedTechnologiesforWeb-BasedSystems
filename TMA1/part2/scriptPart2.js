/* 

COMP 466 Advanced Technologies for Web-Based Systems
TMA 1

Erika Racette

This is the javascript file of a Web App that fulfills the requirements of part 2 of TMA 1.

Tutorials used:
HTML Input/CSS -
https://www.w3schools.com/html/html_form_input_types.asp

Class action listeners-
https://stackoverflow.com/questions/76179463/javascript-foreach-and-3-buttons
https://stackoverflow.com/questions/42080365/using-addeventlistener-and-getelementsbyclassname-to-pass-an-element-id

<pre><code>-
https://stackoverflow.com/questions/4611591/code-vs-pre-vs-samp-for-inline-and-block-code-snippets

Javascript-
https://www.w3schools.com/jsref/jsref_tofixed.asp
https://www.w3schools.com/jsref/jsref_trim_string.asp
https://www.w3schools.com/js/js_string_templates.asp

Simple XML-
https://www.tutorialspoint.com/xml/xml_syntax.htm

XSD-
https://www.techtarget.com/whatis/definition/XSD-XML-Schema-Definition

*/

//When the page is loaded
document.addEventListener("DOMContentLoaded", function() {

    //Get references to all sections
    const title = document.getElementById('title'); //Title text of banner

    const homeSection = document.getElementById('homeSection');
    const homeLink = document.getElementById('homeLink');
        homeLink.classList.add('active'); //Make the home tab the first active one

    //Unit 1 - HTML+CSS
    const unit1Section = document.getElementById('unit1Section');
    const unit1Link = document.getElementById('unit1Link');

    //Unit 2 - Javascript
    const unit2Section = document.getElementById('unit2Section');
    const unit2Link = document.getElementById('unit2Link');

    //Unit 3 - XML
    const unit3Section = document.getElementById('unit3Section');
    const unit3Link = document.getElementById('unit3Link');

    //Quizzes section
    const quizzesSection = document.getElementById('quizzesSection');
    const quizzesLink = document.getElementById('quizzesLink');

    //The unit quiz section container that will dynamically load content+question depending on the selected quiz
    const unitQuiz = document.getElementById('unitQuiz'); 
    const xmlDiv = document.getElementById('unitQuizContent'); //The div that will house the XML content
    const submitButton = document.getElementById('submitBtn');  //Submit button to grade quiz
    const quizResults = document.getElementById('quizResults'); //The div to show the user's results

    //Create an array to hold the nav bar links
    const links = [homeLink, unit1Link, unit2Link, unit3Link, quizzesLink];

    //Create another array with the content
    const content = [homeSection, unit1Section, unit2Section, unit3Section, quizzesSection];

    //Create an array for the header title strings
    const headerTitle = ["♡ Web Tech Learning ♡", "Unit 1", "Unit 2", "Unit 3", "Unit Quizzes"];

    if(links.length == content.length) {
        links.forEach((link, index) => {
            //Go through each link and create an action listener
            link.addEventListener('click', () => {
                showSection(link, content[index], headerTitle[index]); //Show associated content with the link
            });
        });
    }

    //Function to show the selected section and hide others
    //@param navLink - is the nav bar the user clicked
    //@param sectionID - is the href the user clicked, the ID of the section to be displayed
    //@param titleString - is what to replace the header text with
    function showSection(navLink, sectionID, titleString) {

        //Remove all active links
        links.forEach(link => link.classList.remove('active')); 
        navLink.classList.add('active'); //Add the one clicked to be the active one 

        //Hide all sections first
        content.forEach(content => content.style.display = 'none'); //Hide all content first
        unitQuiz.style.display = 'none'; //Also hide unit quiz content
        sectionID.style.display = 'block'; //Show the section that was clicked

        //Change the title
        title.innerHTML = titleString;

    }

    //Add event listeners to all quiz button classes
    document.querySelectorAll('.unit1QuizBtn').forEach(button => {
        button.addEventListener('click', () => showQuiz('unit1Quiz')); //pass unit 1 as parameter for showQuiz()
    });

    document.querySelectorAll('.unit2QuizBtn').forEach(button => { //Do this for all quizes
        button.addEventListener('click', () => showQuiz('unit2Quiz'));
    });

    document.querySelectorAll('.unit3QuizBtn').forEach(button => {
        button.addEventListener('click', () => showQuiz('unit3Quiz'));
    });
    
    function showQuiz(quiz) {
        //console.log("Show quiz");
    
        showSection(quizzesLink, unitQuiz, "Unit Quiz"); //Show general unit quiz content and hide others

        loadQuizContent(quiz); //Load quiz based on selected quiz
    }

    function loadQuizContent(quiz) {

        //console.log("Loading quiz: " + quiz);

        quizResults.innerHTML = ""; //Clear any previous content in the div
        
        const xhr = new XMLHttpRequest();

        xhr.open('GET', quiz + '.xml', true); //Open the selected quiz file

        xhr.onreadystatechange = function() {

            if (xhr.readyState === 4 && xhr.status === 200) { //On successful load...

                const xmlFile = xhr.responseXML;

                const title = xmlFile.getElementsByTagName('title')[0].textContent; //Get the title of the quiz
                const questions = xmlFile.getElementsByTagName('question'); //Get each question tag

                //Create a variable that will hold the html content to be injected into the section
                //let quizHtml = '<h2 id="title">' + title + '</h2>';  //Add the fetched title onto it
                let quizHtml = `<h2 id="title">${title}</h2>`;  //Add the fetched title onto it

                for (let i = 0; i < questions.length; i++) { //For all of the question in the xml file...

                    const questionText = questions[i].getElementsByTagName('text')[0].textContent; //Set the questionText var to the question text 'text'
                    const answers = questions[i].getElementsByTagName('answer'); //Get the answer tags of each question

                    quizHtml += `<div class="question"> 
                                    <p>${i + 1}. ${questionText}</p>`; //Add onto the html and create a question class, label each iteration as i + 1 (question number)

                                    for (let j = 0; j < answers.length; j++) { //For all of the answers given in the quiz
                                        quizHtml += `<div class="answer">
                                                        <input type="radio" name="q${i}" value="${answers[j].getAttribute('correct') === 'true' ? 'correct' : 'incorrect'}">
                                                        ${answers[j].textContent}
                                                    </div>`; //Create another class and add a radio button for each answer. Get the incorrect/correct status of each answer (correct="true/false")
                                    }

                    quizHtml += `</div>`; //Once all of the questions and their answers have been appended to the html, end it by adding the </div> tag
                }
                xmlDiv.innerHTML = quizHtml; //Now add it onto the 'unitQuiz' section
            }
        };
        xhr.send();
    }

    //Submit Button
    submitButton.addEventListener("click", () => {
        gradeQuiz();
         window.scrollTo(0, document.body.scrollHeight); //Scroll to the bottom of the quiz section/page
    });

    //Grade the answers, show correct answers, as well as score in percentage
    function gradeQuiz() {

        const questions = document.querySelectorAll('.question'); //Select all question divs

        if(questions) { //If there are questions displayed

            quizResults.innerHTML = ""; //Clear any previous content in the div

            let userScore = 0; //Start from 0
            
            let resultHtml = ''; //Variable to hold the result HTML content
        
            questions.forEach((question, index) => { //For each question in the question container

                const questionText = question.querySelector('p').textContent.trim(); //Get the question text

                const selectedAnswer = question.querySelector('input[type="radio"]:checked'); //Find the selected radio button

                const answers = question.querySelectorAll('.answer'); //Get all of it's possible answers

                if (selectedAnswer && selectedAnswer.value === 'correct') { //If the radio button was checked AND had a value of correct (value = correct: true/false)
                    
                    userScore++; //Correct, Add 1 to the user's score

                } else { //Else, it was a wrong answer or unanswered

                    //Find the correct answer
                    const correctAnswer = Array.from(answers) //For each of the answers
                        .find(answer => answer.querySelector('input[type="radio"]').value === 'correct');

                    if (correctAnswer) { //If it's the correct answer
                        
                        //Add a notification saying that the answer was actually:
                        resultHtml += `<p>Question: ${questionText}<br>
                            <span style="color: red;">Incorrect. The correct answer was: ${correctAnswer.textContent.trim()}</span></p>`;  //Get the answer and trim the text
                    }
                }
            });

            //Calculate percentage
            const percentage = (userScore / questions.length) * 100; //userScore / how many questions there were
        
            //Add their results to the html container
            resultHtml += `<h3>Quiz Results</h3>`; //Display what they scored 
            resultHtml += `<p>You scored ${userScore} out of ${questions.length} (${percentage.toFixed(2)}%)</p>`;
            quizResults.innerHTML += resultHtml;
        }
    }
});
