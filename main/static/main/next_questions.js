
function submitForm(questionIndex) {
    var currentQuestion = document.getElementById('question' + questionIndex);
    currentQuestion.style.display = 'none';

    var testContent = currentQuestion.closest('.collapse');
    var allQuestions = testContent.querySelectorAll('.question');
    var questionIds = Array.from(allQuestions).map(function(question) {
        return parseInt(question.id.replace('question', ''), 10);
    });

    // Find the index of the current question's ID in the sorted array
    var currentIndex = questionIds.indexOf(questionIndex);

    // Find the next question with a higher ID
    var nextQuestionId = questionIds.find(function(id, index) {
        return index > currentIndex;
    });

    if (nextQuestionId) {
        var nextQuestion = document.getElementById('question' + nextQuestionId);
        nextQuestion.style.display = 'block';
    } else {
        // If there's no next question within the same test, proceed to the next test
        var nextTestContent = testContent.nextElementSibling;
        if (nextTestContent) {
            nextTestContent.classList.add('show');
            var firstQuestionOfNextTest = nextTestContent.querySelector('.question');
            if (firstQuestionOfNextTest) {
                firstQuestionOfNextTest.style.display = 'block';
            }
        }
    }

    return false;
}

