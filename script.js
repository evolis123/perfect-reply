const receivedEmailTextarea = document.getElementById('received-email');
const userReplyTextarea = document.getElementById('user-reply');
const generateButton = document.getElementById('generate-button');
const resultArea = document.getElementById('result-area');
const outputDiv = document.getElementById('output');
const loadingSpinner = document.getElementById('loading-spinner');

generateButton.addEventListener('click', async () => {
    const receivedEmail = receivedEmailTextarea.value;
    const userReply = userReplyTextarea.value;

    if (!receivedEmail || !userReply) {
        alert('Please fill in both fields.');
        return;
    }

    resultArea.style.display = 'block';
    loadingSpinner.style.display = 'block';
    outputDiv.textContent = '';
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';

    try {
        const response = await fetch('/.netlify/functions/generate-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receivedEmail, userReply }),
        });
        const data = await response.json();
        outputDiv.textContent = data.reply;

    } catch (error) {
        outputDiv.textContent = 'An error occurred. Please try again later.';
        console.error('Error:', error);
    } finally {
        loadingSpinner.style.display = 'none';
        generateButton.disabled = false;
        generateButton.textContent = '✨ Generate The Perfect Reply';
    }
});