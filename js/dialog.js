function showError(message) {
    const body = document.getElementsByTagName('body')[0];

    const errorDialog = document.createElement('div');
    errorDialog.id = 'error-dialog';
    errorDialog.className = "error-dialog hidden";
    
    const errorMessage = document.createElement('p');
    errorMessage.id = 'error-message';
    errorMessage.className = 'text-right'
    errorMessage.textContent = message; // Set the error message

    errorDialog.classList.remove('hidden'); // Show the dialog
    errorDialog.style.opacity = '1'; // Ensure it's fully visible

    errorDialog.appendChild(errorMessage);
    body.appendChild(errorDialog);

    // Hide the dialog after 5 seconds
    setTimeout(() => {
        errorDialog.style.opacity = '0'; // Fade out effect
        setTimeout(() => {
            errorDialog.classList.add('hidden'); // Hide it completely after fade out
            errorDialog.style.opacity = '1'; // Reset opacity for future use
        }, 500); // Match this with CSS transition duration
    }, 5000);
}



function showSuccess(message) {
    const body = document.getElementsByTagName('body')[0];

    const errorDialog = document.createElement('div');
    errorDialog.id = 'success-dialog';
    errorDialog.className = "success-dialog hidden";
    
    const errorMessage = document.createElement('p');
    errorMessage.id = 'success-message';
    errorMessage.className = 'text-right'
    errorMessage.textContent = message; // Set the error message
    
    errorDialog.classList.remove('hidden'); // Show the dialog
    errorDialog.style.opacity = '1'; // Ensure it's fully visible

    errorDialog.appendChild(errorMessage);
    body.appendChild(errorDialog);

    // Hide the dialog after 5 seconds
    setTimeout(() => {
        errorDialog.style.opacity = '0'; // Fade out effect
        setTimeout(() => {
            errorDialog.classList.add('hidden'); // Hide it completely after fade out
            errorDialog.style.opacity = '1'; // Reset opacity for future use
        }, 500); // Match this with CSS transition duration
    }, 5000);
}
