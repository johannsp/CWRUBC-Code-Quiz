// Aliases to positions in the DOM
// In main window
var startButton = document.querySelector("#question"); 
var highScoreButton = document.querySelector("#highScore"); 
// In question modal
var minDisplay = document.querySelector("#minutesLeft");
var secDisplay = document.querySelector("#secondsLeft");
var questionDiv = document.querySelector("#textQuestion");
var answerInput = document.querySelector("#answerInput");
var answerAButton = document.querySelector("#answerA"); 
var answerAText = document.querySelector("#textA"); 
var answerBButton = document.querySelector("#answerB"); 
var answerBText = document.querySelector("#textB"); 
var answerCButton = document.querySelector("#answerC"); 
var answerCText = document.querySelector("#textC"); 
var answerDButton = document.querySelector("#answerD"); 
var answerDText = document.querySelector("#textD"); 

// Status variables
var totalSeconds = 0;
var secondsElapsed = 0;

var interval;

var questionList [
  {askText: "Javascript expression '1' + 1 will evaluate to:",
  answerA: "11",
  answerB: "2",
  answerC: "undefined",
  answerD: "NaN",
  correct: "A"},
  {askText: "",
  answerA: "",
  answerB: "",
  answerC: "",
  answerD: "",
  correct: ""},
];

function showQuestion(i) {
  questionDiv.textContent = ' '+questionList[i].askText;
  answerAText.textContent = ' '+questionList[i].answerA;
  answerBText.textContent = ' '+questionList[i].answerB;
  answerCText.textContent = ' '+questionList[i].answerC;
  answerDText.textContent = ' '+questionList[i].answerD;
  
}
//startButton.addEventListener("click", startTimer);
