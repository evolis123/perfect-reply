// === main-v1.js ===
// YENİLƏNMİŞ FAYL: Modal Pəncərə logikası əlavə edildi.

document.addEventListener('DOMContentLoaded', () => {
    // Bütün DOM elementlərini seçirik
    const receivedEmailTextarea = document.getElementById('received-email');
    const userReplyTextarea = document.getElementById('user-reply');
    const generateButton = document.getElementById('generate-button');
    const resultArea = document.getElementById('result-area');
    const outputDiv = document.getElementById('output');
    const loadingSpinner = document.getElementById('loading-spinner');
    const buttonText = document.getElementById('button-text');
    const languageWarning = document.getElementById('language-warning');
    const refineActionsDiv = document.getElementById('refine-actions');

    const loadingMessages = [
        "Analyzing the email...",
        "Crafting the perfect sentences...",
        "Polishing the result...",
        "Almost there..."
    ];
    let messageInterval;

    function setLoadingState(isLoading) {
        if (isLoading) {
            let messageIndex = 0;
            loadingSpinner.style.display = 'block';
            buttonText.textContent = loadingMessages[messageIndex];
            
            messageInterval = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                buttonText.textContent = loadingMessages[messageIndex];
            }, 2000);
        } else {
            clearInterval(messageInterval);
            loadingSpinner.style.display = 'none';
            buttonText.textContent = 'Generate with ProLingo';
        }
    }

    function showUserFriendlyError(message) {
        console.error("Internal Error:", message);
        let userMessage = message || "Sorry, something unexpected happened. Please try again.";

        if (message.includes("503") || message.includes("overloaded")) {
            userMessage = "We're experiencing high demand right now. Please try again in a few moments.";
        } else if (message.includes("Could not determine")) {
             userMessage = "Sorry, we couldn't determine the language of the received email. Please ensure it is in English.";
        }
        
        outputDiv.style.display = 'block';
        outputDiv.textContent = userMessage;
    }
    
    function isStrictlyEnglish(text) {
        if (!text) return true;
        const englishOnlyRegex = /^[a-zA-Z0-9\s.,!?'"()&$#@*+\-/:;{}[\]\n\r%_`~@^|=<>]*$/;
        return englishOnlyRegex.test(text);
    }

    function validateInputs() {
        const isEnglish = isStrictlyEnglish(receivedEmailTextarea.value);
        const isUserReplyFilled = userReplyTextarea.value.trim() !== '';
        const isReceivedEmailFilled = receivedEmailTextarea.value.trim() !== '';

        if (!isEnglish) {
            languageWarning.style.display = 'block';
            generateButton.disabled = true;
        } else {
            languageWarning.style.display = 'none';
            generateButton.disabled = !(isUserReplyFilled && isReceivedEmailFilled);
        }
    }

    async function handleGenerate() {
        if (!userReplyTextarea.value.trim() || !receivedEmailTextarea.value.trim()) {
             showUserFriendlyError('Please fill in both fields before generating a reply.');
             return;
        }

        resultArea.style.display = 'block';
        outputDiv.innerHTML = '';
        generateButton.disabled = true;
        refineActionsDiv.style.display = 'none';
        setLoadingState(true);

        try {
            const response = await fetch('/.netlify/functions/generate-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    receivedEmail: receivedEmailTextarea.value, 
                    userReply: userReplyTextarea.value, 
                    tone: document.querySelector('input[name="tone"]:checked').value 
                }),
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            outputDiv.style.display = 'block';
            outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
            refineActionsDiv.style.display = 'flex';

        } catch (error) {
            showUserFriendlyError(error.message);
        } finally {
            setLoadingState(false);
            generateButton.disabled = false; 
        }
    }

    async function handleRefine(textToRefine, action) {
        console.log(`Sending to refine function. Action: ${action}`);

        resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        outputDiv.innerHTML = ''; 
        refineActionsDiv.style.display = 'none'; 
        generateButton.disabled = true; 
        setLoadingState(true);

        try {
            const response = await fetch('/.netlify/functions/refine-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    textToRefine: textToRefine, 
                    action: action           
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>'); 
            refineActionsDiv.style.display = 'flex'; 

        } catch (error) {
            showUserFriendlyError(error.message);
        } finally {
            setLoadingState(false);
            generateButton.disabled = false; 
        }
    }

    generateButton.addEventListener('click', handleGenerate);
    receivedEmailTextarea.addEventListener('input', validateInputs);
    userReplyTextarea.addEventListener('input', validateInputs);

    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    const scenarios = {
        'thank-you': 'Write a polite and professional thank-you email after a job interview for the [Job Title] position with [Company Name]. I want to reiterate my interest in the role.',
        'recommendation': 'Write a formal email asking my former manager, [Manager\'s Name], for a letter of recommendation for a [Program/Job Title] I am applying to.',
        'apology': 'Write a sincere apology email for the delay in my response regarding [Subject of Email]. Provide a brief reason and assure them it won\'t happen again.',
        'inquiry': 'Write a clear and concise email to inquire about [Specific Topic, e.g., the status of my application] sent on [Date].'
    };
    scenarioButtons.forEach(button => {
        button.addEventListener('click', () => {
            const scenarioKey = button.dataset.scenario;
            userReplyTextarea.value = scenarios[scenarioKey];
            userReplyTextarea.focus();
            validateInputs();
        });
    });

    const refineButtons = document.querySelectorAll('.refine-btn');
    refineButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentOutput = document.getElementById('output').innerText;
            const refineAction = button.dataset.refine;
            if (currentOutput.trim() !== "") {
                handleRefine(currentOutput, refineAction);
            }
        });
    });

    validateInputs();

    // =============== YENİ MODAL PƏNCƏRƏ LOGİKASI ===============
    const openModalBtn = document.getElementById('open-feedback-modal');
    const closeModalBtn = document.querySelector('.modal-close');
    const modal = document.getElementById('feedback-modal');

    if (openModalBtn && closeModalBtn && modal) {
        function openModal(e) {
            e.preventDefault(); // Linkin səhifəni yuxarı atmasının qarşısını alır
            modal.style.display = 'flex';
        }

        function closeModal() {
            modal.style.display = 'none';
        }

        openModalBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
});