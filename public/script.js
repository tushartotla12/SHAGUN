// Function to display messages
function displayMessage(message, isError = false) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = message;
    messageContainer.style.color = isError ? 'red' : 'green';
}

// Handle file input change event
document.getElementById('file-upload').addEventListener('change', function(event) {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
        displayMessage(`Please upload your MEMORIES to the wedding album!`);
    } else {
        displayMessage('Please add your MEMORIES to the wedding album!');
    }
});

// Handle form submission and display upload success
const form = document.getElementById('uploadForm');
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const formData = new FormData(form);
    displayMessage('Saving beautiful memories...', false);  // Show message during upload

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            displayMessage('Your cherished moments are now part of the wedding story. Thank you for contributing to our memories!');
        } else {
            displayMessage('Opps I missed saving it! Please upload again', true);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // displayMessage('An error occurred during the upload.', true);
        alert('An error occurred during the upload');
    });
});
