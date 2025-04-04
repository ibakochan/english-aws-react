const quizData = [
{
question: "Which player has won the most IPL trophies?",
a: "M S Dhoni",
b: "Rohit Sharma",
c: "K L Rahul",
d: "Jasprit Bumrah",
correct: "b" },

{
question: "Which player has hit the most fours in IPL?",
a: "Suresh Raina",
b: "Shikhar Dhawan",
c: "Virat Kohli",
d: "Rohit Sharma",
correct: "b" },

{
question: "Where was the final of the inaugural IPL season held?",
a: "D Y Patil Stadium",
b: "Eden Gardens",
c: "Wankhede Stadium",
d: "Brabourne CCI",
correct: "a" },

{
question: "Which player bagged the 'Emerging Player of the Tournament' award in IPL 2008?",
a: "Rohit Sharma",
b: "Shreevats Goswami",
c: "Suresh Raina",
d: "Virat Kohli",
correct: "b" }];

const quiz = document.getElementById("quiz");
const answerEls = document.querySelectorAll(".answer");
const questionEl = document.getElementById("question");
const a_text = document.getElementById("a_text");
const b_text = document.getElementById("b_text");
const c_text = document.getElementById("c_text");
const d_text = document.getElementById("d_text");
const submitBtn = document.getElementById("submit");

let currentQuiz = 0;
let score = 0;

loadQuiz();

function loadQuiz() {
deselectAnswers();

const currentQuizData = quizData[currentQuiz];

questionEl.innerText = currentQuizData.question;
a_text.innerText = currentQuizData.a;
b_text.innerText = currentQuizData.b;
c_text.innerText = currentQuizData.c;
d_text.innerText = currentQuizData.d;
}

function getSelected() {
let answer = undefined;
answerEls.forEach(answerEl => {
if (answerEl.checked) {
answer = answerEl.id;
}
});
return answer;
}

function deselectAnswers() {
answerEls.forEach(answerEl => {
answerEl.checked = false;
});
}

submitBtn.addEventListener("click", () => {
const answer = getSelected();
if (answer) {
if (answer === quizData[currentQuiz].correct) {
score++;
}
currentQuiz++;
if (currentQuiz < quizData.length) { loadQuiz(); } else { quiz.innerHTML=` <h2>You answered correctly at ${score}/${quizData.length} questions.</h2>
    <button onclick="#">Reload</button>
    `;
    }
    }
    });