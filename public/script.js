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
        displayMessage(`${selectedFiles.length} images selected.`);
    } else {
        displayMessage('No image selected.', true);
    }
});

// Handle form submission and display upload success
const form = document.getElementById('uploadForm');
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const formData = new FormData(form);
    displayMessage('Uploading files...', false);  // Show message during upload

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            displayMessage('Upload successful! Files have been uploaded.');
        } else {
            displayMessage('Error uploading files.', true);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('An error occurred during the upload.', true);
    });
});
