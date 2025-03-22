$(document).ready(function() {
    // Arrays of audio element IDs for wrong and correct answers
    var wrongAudioIds = ['audio1', 'audio2', 'audio3', 'audio4'];
    var correctAudioIds = ['audio5', 'audio6', 'audio7', 'audio8', 'audio9', 'audio10', 'audio11', 'audio12', 'audio13'];
    var currentWrongAudioIndex = 0;
    var currentCorrectAudioIndex = 0;

    $('.test-form').submit(function(event) {
        event.preventDefault(); // Prevent default form submission

        var form = $(this);

        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            data: form.serialize(),
            success: function(response) {
                // Display message
                $('.message').text(response.message);

                // Remove any existing icons
                $('.icon').remove();

                // Check if the message is "Correct answer"
                if (response.message === 'Correct answer') {
                    // Append green check mark icon
                    $('.message').after('<span class="icon check-mark text-success" style="font-size: 90px">&#x2713;</span>');

                    // Reset wrong answer audio index to start from 1
                    currentWrongAudioIndex = 0;

                    // Get the current audio element for correct answer and play it
                    var audioElement = document.getElementById(correctAudioIds[currentCorrectAudioIndex]);
                    if (audioElement) {
                        audioElement.volume = 1.0; // Default volume
                        audioElement.play();

                        // Increment the index for the next audio file
                        currentCorrectAudioIndex = (currentCorrectAudioIndex + 1) % correctAudioIds.length;

                        // Check if correct audio index has reached the end
                        if (currentCorrectAudioIndex === 0) {
                            currentCorrectAudioIndex = correctAudioIds.length - 1; // Set it to the last audio element
                        }
                    }
                } else if (response.message === 'Wrong answer') {
                    // Append red cross mark icon
                    $('.message').after('<span class="icon cross-mark text-danger" style="font-size: 90px">&#x2717;</span>');

                    // Reset correct answer audio index to start from 5
                    currentCorrectAudioIndex = 0;

                    // Get the current audio element for wrong answer and play it
                    var audioElement = document.getElementById(wrongAudioIds[currentWrongAudioIndex]);
                    if (audioElement) {
                        audioElement.volume = 1.0; // Default volume
                        audioElement.play();

                        // Increment the index for the next audio file
                        currentWrongAudioIndex = (currentWrongAudioIndex + 1) % wrongAudioIds.length;

                        // Check if wrong audio index has reached the end
                        if (currentWrongAudioIndex === 0) {
                            currentWrongAudioIndex = wrongAudioIds.length - 1; // Set it to the last audio element
                        }
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
                $('.message').text('An error occurred while processing your request.');
            }
        });
    });
});
