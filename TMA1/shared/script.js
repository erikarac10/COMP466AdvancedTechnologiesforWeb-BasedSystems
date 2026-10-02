/* 

COMP 466 Web-Based Systems
TMA 1

Erika Racette

This is the javascript file used for tma1.html

Tutorials used: 
XML-
https://www.w3schools.com/xml/xsl_client.asp
https://learn.microsoft.com/en-us/previous-versions/windows/desktop/ms761399(v=vs.85)

iframe-
https://www.w3schools.com/tags/tag_iframe.ASP

*/

//When the page is loaded
document.addEventListener("DOMContentLoaded", function() {
    //console.log("hi");

    //Get references to all sections
    const aboutContent = document.getElementById('aboutContent');
    const aboutLink = document.getElementById('aboutLink');
        aboutLink.classList.add('active'); //Make the About tab the first active one

    //*Part1: Resume
    const resumeContent = document.getElementById('resumeContent');
    const resumeLink = document.getElementById('resumeLink');

    //*Part2: Web Learning
    const webLearningContent = document.getElementById('webLearningContent');
    const webLearningLink = document.getElementById('webLearningLink');

    //*Part3: Slideshow
    const slideshowContent = document.getElementById('slideshowContent');
    const slideShowLink = document.getElementById('slideshowLink');

    //*Part4: Utility Measurements
    const measurementsContent = document.getElementById('measurementsContent');
    const measurementsLink = document.getElementById('measurementsLink');

    //Create an array to hold the nav bar links
    const links = [aboutLink, resumeLink, webLearningLink, slideShowLink, measurementsLink];

    //Create another array with the content
    const content = [aboutContent, resumeContent, webLearningContent, slideshowContent, measurementsContent];

    //-- Load and setup the content within all links --
    //-- Create event listeners for all menu items
    if(links.length == content.length) {
        links.forEach((link, index) => {
            //Go through each link and create an action listener
            link.addEventListener('click', () => {
                showSection(link, content[index]); //Show associated content with the link
            });
        });
    }

    //Function to show the selected section and hide others
    //@param sectionId - is the href the user clicked, the ID of the section to be displayed
    function showSection(navLink, sectionID) {

        //Remove all active links
        links.forEach(link => link.classList.remove('active')); 
        navLink.classList.add('active'); //Add the one clicked to be the active one 

        //Hide all sections first
        content.forEach(content => content.style.display = 'none'); //Hide all content first
        sectionID.style.display = 'block'; //Show the section that was clicked

    }

    //showSection(link[0], content[0]); //Make the About tab display first

    //--------*Part1: Resume
    //Load XML and XSLT files for resume
    loadResumeContent();
    
    //Function to load XML document via AJAX
    function loadXMLDoc(filename, callback) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(this.responseXML);
            }
        };
        xhttp.open("GET", filename, true);
        xhttp.send();
    }

    //Function to load the XML and XSLT files
    function loadResumeContent() {
        loadXMLDoc('part1/resume.xml', function(xml) {
            loadXMLDoc('part1/resume.xsl', function(xsl) {
                //Transform the XSLT
                if (window.ActiveXObject || "ActiveXObject" in window) {
                    //For old browsers - 
                    let ex = xml.transformNode(xsl);
                    resumeContent.innerHTML = ex; //Display the content in thr resumeConent div
                } else if (document.implementation && document.implementation.createDocument) {
                    //For Chrome, Firefox, Opera, etc.
                    let xsltProcessor = new XSLTProcessor();
                    xsltProcessor.importStylesheet(xsl); //Import the style sheet
                    let resultDocument = xsltProcessor.transformToFragment(xml, document); //Apply style sheet to xml
                    resumeContent.appendChild(resultDocument); //Put it in the resumeContent href
                }
            });
        });
    }
    
});