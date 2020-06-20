// Aliases to positions in the DOM
// In main window
var startButton = document.querySelector("#startButton"); 
var highScoreButton = document.querySelector("#highScoreButton"); 
// In question card
var minDisplay = document.querySelector("#minutesLeft");
var secDisplay = document.querySelector("#secondsLeft");
var scoreDisplay = document.querySelector("#curScore");
var statusDisplay = document.querySelector("#answerStatus");
var questionDiv = document.querySelector("#textQuestion");
var questionNum = document.querySelector("#questionNum");
var answerInput = document.querySelector("#answerInput");

var choiceButtons= document.querySelector(".buttons");
var choiceAText = document.querySelector("#textA"); 
var choiceBText = document.querySelector("#textB"); 
var choiceCText = document.querySelector("#textC"); 
var choiceDText = document.querySelector("#textD"); 

// In high score modal window
/* {{{ Note, jQuery need to be used for the DOM reference to use Bootstrap's modal() method.
 * var highScoreModal = document.querySelector("#highScoreModal");
 * }}} */
var highScoreModal = $("#highScoreModal");
/* {{{ Note, jQuery need to be used for the DOM reference to use Bootstrap's collapse() method.
 * var highScoreNameDiv = document.querySelector("#canAddHighScore"); 
 * }}} */
var highScoreNameDiv = $("#canAddHighScore"); 
var highScoreNameInput = document.querySelector("#addNameForHighScore"); 
var addHighScoreButton = document.querySelector("#addHighScore"); 
var clearHighScoreButton = document.querySelector("#clearHighScore"); 
var closeHighScoreButton = document.querySelector("#closeHighScore"); 
var highScoreListDiv = document.querySelector("#scoreList"); 

const quizPeriodMinutes = 5;
const quizPeriodSeconds = 0;
var quizQuestion = 0;
var quizScore = 0;
var answerCorrect = "";
var highScoreList = [];

// Status variables
var totalSeconds = 0;
var secondsElapsed = 0;

var interval;

// Questions are stored in array of objects, one for each question.
var questionList = [
  {askText: "Javascript expression '1' + 1 will evaluate to:",
  choiceA: "11",
  choiceB: "2",
  choiceC: "undefined",
  choiceD: "NaN",
  correct: "A"},
  {askText: "('1' == 1) evaluates to:",
  choiceA: "true",
  choiceB: "false",
  choiceC: "undefined",
  choiceD: "NaN",
  correct: "A"},
  {askText: "('1' === 1) evaluates to:",
  choiceA: "true",
  choiceB: "false",
  choiceC: "undefined",
  choiceD: "NaN",
  correct: "B"},
  {askText: "The correct syntax for an object method to access an object property x is:",
  choiceA: "object.x",
  choiceB: "my.x",
  choiceC: "self.x",
  choiceD: "this.x",
  correct: "D"},
  {askText: "A Javascript closure is:",
  choiceA: "An anonymous function, a function with no function name",
  choiceB: "A short cut notation that uses => to create an anonymous function",
  choiceC: "A method for guaranteeing a recursive function closes down without errors",
  choiceD: "A technique to force function scope variables to be preserved for further use",
  correct: "D"},
  {askText: "Math.floor(Math.random * 10) gives a random number between:",
  choiceA: "0 and 9",
  choiceB: "0 and 10",
  choiceC: "1 and 10",
  choiceD: "1 and 11",
  correct: "A"},
  {askText: "for (var i = 0; i < 11; i += 2) { alert(i); } will show alerts for:",
  choiceA: "0 1 2 3 4 5 6 7 8 9 10",
  choiceB: "0 1 2 3 4 5 6 7 8 9 10 11",
  choiceC: "0 2 4 6 8 10",
  choiceD: "1 3 5 7 9 11",
  correct: "C"},
  {askText: "(NaN == NaN) evaluates to:",
  choiceA: "true",
  choiceB: "false",
  choiceC: "undefined",
  choiceD: "NaN",
  correct: "B"},
  {askText: "Can an object call a method that belongs to another object?",
  choiceA: "No, never.",
  choiceB: ".call can be used if the other object has the needed properties",
  choiceC: ".apply can be used if the other object has the needed properties",
  choiceD: "both .call and .apply could be used for this purpose",
  correct: "D"},
  {askText: "Math.max.apply(null, [1, 2, 3, 5, 0] will evaluate to:",
  choiceA: "undefined",
  choiceB: "null",
  choiceC: "0",
  choiceD: "5",
  correct: "D"}
];

function showQuestion(i) {
  answerInput.value = "";
  answerCorrect =  "";
  if (i < questionList.length) {
    questionNum.textContent = "Question: "+(i+1);
    questionDiv.textContent = questionList[i].askText;
    choiceAText.textContent = questionList[i].choiceA;
    choiceBText.textContent = questionList[i].choiceB;
    choiceCText.textContent = questionList[i].choiceC;
    choiceDText.textContent = questionList[i].choiceD;
  } else {
    questionNum.textContent = "Question: ";
    questionDiv.textContent = "";
    choiceAText.textContent = "Type A or click button";
    choiceBText.textContent = "Type B or click button";
    choiceCText.textContent = "Type C or click button";
    choiceDText.textContent = "Type D or click button";
    // When question number is 0 the timer is not running
    // and only fields need to be cleared.
    stopTimer();
    // Visit high score modal
    showHighScoreModal(true);
  }
}

function answerQuestion(i,letter) {
  var answer = letter.toUpperCase();
  var correct = ((i < questionList.length) ? questionList[i].correct : "");
  if (answer == correct) {
    quizScore++;
    answerCorrect = "Correct!";
    renderTimeAndScore(0);
  } else {
    // Run off 5 seconds as penalty!
    answerCorrect = "No, answer was: "+correct;
    renderTimeAndScore(5);
  }
  // Wait for 5 seconds so last answer status can be seen then show next
  // question.
  setTimeout(showQuestion(++quizQuestion),5000);
}

// These two functions are just for making sure the numbers look nice for the
// html elements.
function getRemainingMinutes() {
  //
  var secondsLeft = totalSeconds - secondsElapsed;
  var minutesLeft = Math.floor(secondsLeft / 60);

  return ((minutesLeft < 10) ? "0" : "") + minutesLeft;
}

function getRemainingSeconds() {
  var secondsLeft = (totalSeconds - secondsElapsed) % 60;

  return ": "+((secondsLeft < 10) ? "0" : "") + secondsLeft;
}

// This function ensures the timer is reset and readies the quiz timer by
// initializing totalSeconds.
function readyStartingTime() {
  clearInterval(interval);
  totalSeconds = (quizPeriodMinutes * 60) + quizPeriodSeconds;
}

// This function renders the time and other quiz status information.
function renderTimeAndScore(runOffTime) {
  // Run off extra time as needed
  // when a missed guess penalty applies
  secondsElapsed += runOffTime;
  minDisplay.textContent = getRemainingMinutes();
  secDisplay.textContent = getRemainingSeconds();
  // Show current score as well
  scoreDisplay.textContent = quizScore;
  statusDisplay.textContent = answerCorrect;

  // and then checks to see if the time has run out
  if (secondsElapsed >= totalSeconds) {
    // Update question explicitly requesting after the last question, which
    // will clear the questions and stop the timer.
    showQuestion(questionList.length);
  }
}

// This function is where the "time" aspect of the timer runs
// Notice no settings are changed other than to increment the secondsElapsed var
function startTimer() {
  quizQuestion = 0;
  quizScore = 0;
  showQuestion(quizQuestion);
  readyStartingTime();

  // Add keypress event at whole document scope so a key stroke can be used to
  // answer without bring focus to a specific control.
  document.addEventListener("keypress", ReadKeysABCD);

  // Timer interval handles updating the time remaining
  interval = setInterval(function() {
    secondsElapsed++;
    // So renderTimeAndScore() is called here once every second.
    renderTimeAndScore(0);
  }, 1000);
}

// This function stops the interval and also resets secondsElapsed
// and calls "setTime()" which effectively reset the timer
// to the input selections workMinutesInput.value and restMinutesInput.value
function stopTimer() {
  secondsElapsed = 0;
  readyStartingTime();
  document.removeEventListener("keypress", ReadKeysABCD);
  // Since showQuestion() calls stopTimer() do not call that function here.
  renderTimeAndScore(0);
}

function displayHighScoreRows() {
  var d = document.createDocumentFragment();

  function addHighScoreRow(score, name) {
     const colClass = "col-6 col-sd-6";
     // Ready new row
     var newRow = document.createElement('div');
     newRow.setAttribute("class","row");
     // Ready column for score
     var colScore = document.createElement('div'); 
     colScore.setAttribute("class",colClass);
     colScore.textContent = score;
     newRow.appendChild(colScore);
     // Ready column for name
     var colName = document.createElement('div'); 
     colName.setAttribute("class",colClass);
     colName.textContent = name;
     newRow.appendChild(colName);
     // Add new row to the bottom of the document fragment
     d.appendChild(newRow);
  }

  for (r of highScoreList) {
    addHighScoreRow(r.score, r.name)
  }
  // Clear all child nodes in the DOM representation of the high score list.
  highScoreListDiv.textContent = "";
  highScoreListDiv.appendChild(d);
}

function addAHighScore() {
  var newHighScore = {};
  newHighScore.score = quizScore;
  newHighScore.name = highScoreNameInput.value;
  // Add new scores at top
  highScoreList.unshift(newHighScore);
  // Save the updated high score list right away
  localStorage.setItem("codeQuiz_HighScore",JSON.stringify(highScoreList));
  // Redisplay the list
  displayHighScoreRows();
  // Close the add initials section to prevent adding initials more than once.
  highScoreNameDiv.collapse("hide");
}

function showHighScoreModal(allowAddHighScore) {
  if (allowAddHighScore !== true) {
    allowAddHighScore = false;
  }
  highScoreModal.modal("show");
  if (allowAddHighScore) {
    highScoreNameDiv.collapse("show");
    // Put the focus in the initials input for the user
    highScoreNameInput.focus()
  }
  storedHighScoreList = JSON.parse(localStorage.getItem("codeQuiz_HighScore"));
  if (storedHighScoreList !== null) {
    highScoreList = storedHighScoreList;
  }
  displayHighScoreRows();
}

function clearHighScoreModal() {
  highScoreList.splice(0,highScoreList.length)
  localStorage.setItem("codeQuiz_HighScore",JSON.stringify(highScoreList));
  displayHighScoreRows();
}

function closeHighScoreModal() {
  highScoreModal.modal("hide");
}

// Will add then remove a keypress event at whole document scope so a key
// stroke can be used to answer without bring focus to a specific control.
function ReadKeysABCD(event) { 
  var rxDigit = /[A-Da-d]/;
  event.preventDefault();
  answerInput.value = event.key;
  if (rxDigit.test(event.key)) {
    answerQuestion(quizQuestion,event.key);
  }
}

// Start button begins the timed quiz by starting the timer and showing the
// first question.
startButton.addEventListener("click", startTimer);

highScoreButton.addEventListener("click", showHighScoreModal);

addHighScoreButton.addEventListener("click", addAHighScore);
clearHighScoreButton.addEventListener("click", clearHighScoreModal);
closeHighScoreButton.addEventListener("click", closeHighScoreModal);

// Event delegation allows all four answer buttons to be hooked to the same
// listen with a per button data-letter attribute referenced to get the user's
// answer. 
choiceButtons.addEventListener("click", function(event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.target.matches("button")) {
    answerInput.value = event.target.dataset.letter;
    answerQuestion(quizQuestion,event.target.dataset.letter);
  }
});

/* {{{ vim: set sw=2 ai lbr tw=0 fdm=marker fdl=0 :
 * Set modeline for vim text editor
 * }}} */
