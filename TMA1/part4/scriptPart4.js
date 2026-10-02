/* 

COMP 466 Advanced Technologies for Web-Based Systems
TMA 1

Erika Racette

This is the javascript file of a Web App that fulfills the requirements of part 4 of TMA 1.

Tutorials used: 
Timezones-
https://time-time.net/times/time-zones/usa-canada/current-mountain-time-mst.php
https://www.w3schools.com/jsref/jsref_tolocalestring.asp
https://www.geeksforgeeks.org/how-to-convert-date-to-another-timezone-in-javascript/
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

Measurements-
https://www.omnicalculator.com/conversion/weight-converter
https://www.omnicalculator.com/conversion/length-converter
https://www.calculatorsoup.com/calculators/conversions/area.php
https://www.omnicalculator.com/conversion/volume-conversion

Mortgage formula-
https://www.youtube.com/watch?v=6bLg_Ex0A-4

Fetch ajax-
https://www.freecodecamp.org/news/how-to-use-fetch-api/

*/
document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.getElementById('homeLink');
        homeLink.classList.add('active');
    const measurementConverterLink = document.getElementById('measurementConverterLink');
    const mortgageCalculatorLink = document.getElementById('mortgageCalculatorLink');
    const additionalToolLink = document.getElementById('additionalToolLink');

    const content = document.getElementById('content'); //Div each section will be appended to

    const header = document.querySelector('header h1');

    //Create an array to hold the nav bar links
    const links = [homeLink, measurementConverterLink, mortgageCalculatorLink, additionalToolLink];

    //Create another array with the section links
    const sections = [
        "utility-tools/home.html", 
        "utility-tools/measurementConverter.html", 
        "utility-tools/mortgageCalculator.html", 
        "utility-tools/timeZoneConverter.html"];

    //Array for title string
    const headerTitles = [
        "♡ Utility Tools ♡", 
        "Measurement Converter", 
        "Mortgage Calculator", 
        "Canadian Time-Zone Converter"];

    //-- Load and setup the content within all links --
    //-- Create event listeners for all menu items
    if(links.length == sections.length) {
        links.forEach((link, index) => {
            //Go through each link and create an action listener
            link.addEventListener('click', () => {
                showSection(link, sections[index], headerTitles[index]); //Show associated content with the link
            });
        });
    }

    showSection(links[0], sections[0], headerTitles[0]); //Preload the home section

    //Function to show the selected section and hide others
    //@param navLink - is the nav bar the user clicked
    //@param section -  is the section in the sections array
    //@param titleString - is what to replace the header text with
    function showSection(navLink, section, titleString) {

        //Remove all active links
        links.forEach(link => link.classList.remove('active')); 
        navLink.classList.add('active'); //Add the one clicked to be the active one 

        //Use AJAX to load the new section's content
        loadSectionContent(section);

        //Change the title
        header.innerHTML = titleString;
    }

    //Define the conversion rates in a Javascript object and have rate of conversion for each unit of measurement
    const weightConversionRates = {
        kg: { kg: 1, lbs: 2.2046, st: 0.15747},
        lbs: { kg: 0.453592, lbs: 1, st: 0.071429},
        st: { kg: 6.35029, lbs: 14, st: 1}
    };

    //Another obj for conversion rates
    const lengthConversionRates = {
        m: { m: 1, ft: 3.281, in: 39.37, cm: 100},
        ft: { m: 0.3048, ft: 1, in: 12, cm: 30.48},
        cm: { m: 0.01, ft: 0.03281, in: 0.39370, cm: 1},
        in: { m: 0.0254, ft: 0.08333, in: 1, cm: 2.54}
    };

    //Conversion rates
    const areaConversionRates = {
        m_sq: { m_sq: 1, ft_sq: 10.76391, cm_sq: 10000, in_sq: 1550},
        ft_sq: { m_sq: 0.09290, ft_sq: 1, cm_sq: 929.03, in_sq: 144},
        cm_sq: { m_sq: 0.0001, ft_sq: 0.00107639, cm_sq: 1, in_sq: 0.155},
        in_sq: { m_sq: 0.00064516, ft_sq: 0.0069444, cm_sq: 6.4516, in_sq: 1}
    };

    //Conversion rates
    const volumeConversionRates = {
        l: { l: 1, gal: 0.264172, ml: 1000, oz: 33.814 },
        gal: { l: 3.78541, gal: 1, ml: 3785.41, oz: 128 },
        ml: { l: 0.001, gal: 0.0002642, ml: 1, oz: 0.033814 },
        oz: { l: 0.029574, gal: 0.0078125, ml: 29.5735, oz: 1 }
    };
    
    /*General function that will display an error message in a specified p tag when error is thrown
    @param outputPTag - The <p> tag to display the message in 
    @param message - the message to output in the <p>*/
    function showErrorMessage(outputPTag, message) {
        outputPTag.textContent = message; //Show error message
    }

    /*Function to convert the user's given input for a measurement unit
    @param inputValue - The user's input in a unit's text field
    @param unitObject - The object to use for unit conversion
    @param inputDropdown - the associated dropdown for input
    @param outputDropDown - the associated dropdown for output
    @param outputPTag - which p tag (id) to output the results
    */
    function convertMeasurements(inputValue, unitObject, inputDropdown, outputDropDown, outputPTag) {
        try {
            //Get input numbers
            let unit = parseFloat(inputValue.value.trim()); //Parse to a float after trimming any spaces

            //Check if the user input is a valid number
            if (isNaN(unit)) {
                showErrorMessage(outputPTag, "Please ensure field is filled with valid input.");
                return;
            }

            let fromUnit = inputDropdown.value;
            let toUnit = outputDropDown.value;

            //console.log("unit: " + unit);
            //console.log("fromUnit: " + fromUnit);
            //console.log("toUnit: " + toUnit);

            //Calculate the result (weight input * conversion, to 2 decimal places)
            //Use the [fromUnit][toUnit] to get the key pairs
            let result = (unit * unitObject[fromUnit][toUnit]).toFixed(2);

            //Change the unit to use "²" instead of "sq"
            if (toUnit.includes("_sq")) {
                toUnit = toUnit.replace("_sq", "²");
            }
            
            //Put the resultin the div
            outputPTag.textContent = `Result: ${result} ${toUnit}`;
        } catch (error) {
            showErrorMessage(outputPTag, "Cannot convert entered input.");
        }
    }

    //Calculate the mortgage with user's given inputs in the text fields
    function calculateMortgage(loanAmountInput, interestRateInput, loanTermInput) {
        const mortgageResult = document.getElementById('mortgageResult');
        try {
            //Variables
            const loanAmount = parseFloat(loanAmountInput.value.trim()); //Get the loan number, parse it to a float

            const annualInterestRate = parseFloat(interestRateInput.value) / 100; //Get interest rate (%), turn to decimal
            const monthlyInterestRate = annualInterestRate / 12; //Divide by 12
            const loanTermYears = parseInt(loanTermInput.value, 10); //Years
            const totalPayments = loanTermYears * 12;

            //Check if the user inputs are a valid number
            if (isNaN(loanAmount) || loanAmount <= 0 || isNaN(annualInterestRate) || isNaN(loanTermYears) || loanTermYears <= 0) {
                showErrorMessage(mortgageResult, "Please ensure all fields are filled with valid input.");
                return;
            }
            
            //Calculate monthly payment
            let monthlyPayment;

            if (monthlyInterestRate == 0) { //If there's no interest
                monthlyPayment = (loanAmount / totalPayments).toFixed(2); //monthly = loan/total, fix to 2 decimals
            } else { //for no dividing by 0 erros
                monthlyPayment = ((loanAmount * monthlyInterestRate) / //Formula for mortgage payment
                    (1 - Math.pow(1 + monthlyInterestRate, - totalPayments))
                ).toFixed(2);
            }
            
            //Display
            mortgageResult.textContent = `Monthly Payment: $${monthlyPayment}`;
        } catch (error) {
            showErrorMessage(mortgageResult, "Cannot convert entered input(s).");
        }
    }

    //Timezone offsets in hours
    const timeZones = {
        PST: -8, PDT: -7, 
        MST: -7, MDT: -6, 
        CST: -6, CDT: -5, 
        EST: -5, EDT: -4,
        AST: -4, ADT: -3, 
        NST: -3.5, NDT: -2.5 //Newfoundland (Daylight) and Newfoundland (Standard) are -3:30 and -2:30
    };

    //Convert the time the user has given into a selected timezone
    function convertTime(timeInput, dateInput, timezoneInputDropdown, timezoneOutputDropdown) {
        //console.log(timeZones);
        
        const timeInputResult = document.getElementById('timeInputResult'); //The <p> to display the user's input
        const timeOutputResult = document.getElementById('timeOutputResult'); //The <p> to display the user's output

        //Reset the text inside of the <p> tags
        timeInputResult.innerHTML = "";
        timeOutputResult.innerHTML = "";    

        try {
            //Get current input values
            const time = timeInput.value;
            const date = dateInput.value;
            const timeZoneInput = timezoneInputDropdown.value;
            const timeZoneOutput = timezoneOutputDropdown.value;    

            if (!date || !time || !timeZoneInput || !timeZoneOutput) { //Check for valid inputs
                showErrorMessage(timeInputResult, "Please ensure all fields are filled with valid input.");
                showErrorMessage(timeOutputResult, "");
                return; //Exit immediately
            }

            //Create a new Date object using the user input
            const inputDate = new Date(`${date}T${time}:00`); //Use the 'date' and 'time'
            const inputUtcOffset = timeZones[timeZoneInput];
            const outputUtcOffset = timeZones[timeZoneOutput];
            //console.log("inputDate: " + inputDate);

            //Calculate UTC time from the input timezone
            const utcTime = new Date(inputDate.getTime() - inputUtcOffset * 60 * 60 * 1000);

            //Convert UTC time to the target timezone
            const convertedTime = new Date(utcTime.getTime() + outputUtcOffset * 60 * 60 * 1000);
            
            //Format the output time with the date and time
            const options = { 
                month: '2-digit', day: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit', hour12: true 
            };

            //Format the input/output
            const inputDateTimeStr = new Intl.DateTimeFormat('en-US', options).format(inputDate);
            const outputDateTimeStr = new Intl.DateTimeFormat('en-US', options).format(convertedTime);

            //Output results to the <p> tags
            timeInputResult.innerHTML = `${timeZoneInput} - Date & Time: ${inputDateTimeStr}`;
            timeOutputResult.innerHTML = `${timeZoneOutput} - Date & Time: ${outputDateTimeStr}`;

        } catch (error) {
            showErrorMessage(timeInputResult, "Please enter a valid time and date.");
            showErrorMessage(timeOutputResult, "");
        }
    }

    /*Function to load new content via AJAX (fetch)
    @param url - the url of the html to be loaded into the div id="content"*/
    function loadSectionContent(url) {
        //Clear the content
        content.innerHTML = ''; 

        //Fetch the url and load it
        fetch(url)
            .then(response => {
                if (!response.ok) { //If the response is not ok
                    console.error('Failed to load:', url);
                }
                return response.text();
            })
            .then(data => {
                //Append the loaded data into the content div
                content.innerHTML = data;

                //Initialize each utility tool's action listeners
                switch (url) {
                    case sections[1]:
                        initializeMeasurement();
                        break;
                    case sections[2]:
                        initializeMortgage();
                        break;
                    case sections[3]:
                        initializeTimeZone();
                        break;
                    default:
                        //Nothing (home)
                }
            })
        .catch(error => {
            console.error('Error:', error);
            content.innerHTML = '<p>Count not load content.</p>';
        });
    }

    //When the measurement converter is loaded, initialize action listeners
    function initializeMeasurement() {
        //Define elements for each tab
        //Weight converter variables
        const weightInput = document.getElementById('weightInput');
        const weightInputDropdown = document.getElementById('weightInputDropdown');
        const weightOutputDropdown = document.getElementById('weightOutputDropdown');
        const weightResult = document.getElementById('weightResult');

        //Length converter variables
        const lengthInput = document.getElementById('lengthInput');
        const lengthInputDropdown = document.getElementById('lengthInputDropdown');
        const lengthOutputDropdown = document.getElementById('lengthOutputDropdown');
        const lengthResult = document.getElementById('lengthResult');

        //Area converter variables
        const areaInput = document.getElementById('areaInput');
        const areaInputDropdown = document.getElementById('areaInputDropdown');
        const areaOutputDropdown = document.getElementById('areaOutputDropdown');
        const areaResult = document.getElementById('areaResult');

        //Volume Variables
        const volumeInput = document.getElementById('volumeInput');
        const volumeInputDropdown = document.getElementById('volumeInputDropdown');
        const volumeOutputDropdown = document.getElementById('volumeOutputDropdown');
        const volumeResult = document.getElementById('volumeResult');

        //Create action listeners for each
        //Weight
        weightInput.addEventListener('input', function() {
            convertMeasurements(weightInput, weightConversionRates, weightInputDropdown, weightOutputDropdown, weightResult);
        });
        weightInputDropdown.addEventListener('change', function() {
            convertMeasurements(weightInput, weightConversionRates, weightInputDropdown, weightOutputDropdown, weightResult);
        });
        weightOutputDropdown.addEventListener('change', function() {
            convertMeasurements(weightInput, weightConversionRates, weightInputDropdown, weightOutputDropdown, weightResult);
        });

        //Length
        lengthInput.addEventListener('input', function() {
            convertMeasurements(lengthInput, lengthConversionRates, lengthInputDropdown, lengthOutputDropdown, lengthResult);
        });
        lengthInputDropdown.addEventListener('change', function() {
            convertMeasurements(lengthInput, lengthConversionRates, lengthInputDropdown, lengthOutputDropdown, lengthResult);
        });
        lengthOutputDropdown.addEventListener('change', function() {
            convertMeasurements(lengthInput, lengthConversionRates, lengthInputDropdown, lengthOutputDropdown, lengthResult);
        });

        //Area
        areaInput.addEventListener('input', function() {
            convertMeasurements(areaInput, areaConversionRates, areaInputDropdown, areaOutputDropdown, areaResult);
        });
        areaInputDropdown.addEventListener('change', function() {
            convertMeasurements(areaInput, areaConversionRates, areaInputDropdown, areaOutputDropdown, areaResult);
        });
        areaOutputDropdown.addEventListener('change', function() {
            convertMeasurements(areaInput, areaConversionRates, areaInputDropdown, areaOutputDropdown, areaResult);
        });

        //Volume
        volumeInput.addEventListener('input', function() {
            convertMeasurements(volumeInput, volumeConversionRates, volumeInputDropdown, volumeOutputDropdown, volumeResult);
        });
        volumeInputDropdown.addEventListener('change', function() {
            convertMeasurements(volumeInput, volumeConversionRates, volumeInputDropdown, volumeOutputDropdown, volumeResult);
        });
        volumeOutputDropdown.addEventListener('change', function() {
            convertMeasurements(volumeInput, volumeConversionRates, volumeInputDropdown, volumeOutputDropdown, volumeResult);
        });
    }

    //When the mortgage calculator is loaded, initialize action listeners
    function initializeMortgage() {
        //Mortgage calculator
        const loanAmountInput = document.getElementById('loanAmount');
        const interestRateInput = document.getElementById('interestRate');
        const loanTermInput = document.getElementById('loanTerm');

        //Create action listeners for each
        loanAmountInput.addEventListener('input', function() {
            calculateMortgage(loanAmountInput, interestRateInput, loanTermInput);
        });
        interestRateInput.addEventListener('input', function() {
            calculateMortgage(loanAmountInput, interestRateInput, loanTermInput);
        });
        loanTermInput.addEventListener('input', function() {
            calculateMortgage(loanAmountInput, interestRateInput, loanTermInput);
        });
    }
    
    //When the mortgage calculator is loaded, initialize action listeners
    function initializeTimeZone() {
        //Timezone converter
        const timeInput = document.getElementById('timeInput'); //The time the user input
        const dateInput = document.getElementById('dateInput'); //The date field the user entered in

        const timezoneInputDropdown = document.getElementById('timezoneInput'); //Timezone input
        const timezoneOutputDropdown = document.getElementById('timezoneOutput'); //Timezone output

        //Create action listeners for each
        timeInput.addEventListener('change', function() {
            convertTime(timeInput, dateInput, timezoneInputDropdown, timezoneOutputDropdown);
        });
        dateInput.addEventListener('change', function() {
            convertTime(timeInput, dateInput, timezoneInputDropdown, timezoneOutputDropdown);
        });
        timezoneInputDropdown.addEventListener('change', function() {
            convertTime(timeInput, dateInput, timezoneInputDropdown, timezoneOutputDropdown);
        });
        timezoneOutputDropdown.addEventListener('change', function() {
            convertTime(timeInput, dateInput, timezoneInputDropdown, timezoneOutputDropdown);
        });
    }
});
