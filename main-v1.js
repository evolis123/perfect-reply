document.addEventListener('DOMContentLoaded', () => {
    // --- Bütün DOM elementlərini seçirik ---
    const receivedEmailTextarea = document.getElementById('received-email');
    const userReplyTextarea = document.getElementById('user-reply');
    const generateButton = document.getElementById('generate-button');
    const resultArea = document.getElementById('result-area');
    const outputDiv = document.getElementById('output');
    const refineActionsDiv = document.getElementById('refine-actions');
    const buttonText = document.getElementById('button-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const languageWarning = document.getElementById('language-warning');
    const toneCompassPopover = document.getElementById('tone-compass-popover');
    const popoverIcon = document.getElementById('popover-icon');
    const popoverText = document.getElementById('popover-text');
    
    const loadingMessages = [ "Analyzing the email...", "Crafting the perfect sentences...", "Polishing the result...", "Almost there..." ];
    let messageInterval;

    function setLoadingState(isLoading) {
        if (isLoading) {
            let messageIndex = 0;
            if(loadingSpinner) loadingSpinner.style.display = 'block';
            if(buttonText) buttonText.textContent = loadingMessages[messageIndex];
            messageInterval = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                if(buttonText) buttonText.textContent = loadingMessages[messageIndex];
            }, 2000);
        } else {
            clearInterval(messageInterval);
            if(loadingSpinner) loadingSpinner.style.display = 'none';
            if(buttonText) buttonText.textContent = 'Generate with ProLingo';
        }
    }

    function showUserFriendlyError(message) {
        console.error("Internal Error:", message);
        let userMessage = message || "Sorry, something unexpected happened. Please try again.";
        if (String(message).includes("503") || String(message).includes("overloaded")) {
            userMessage = "We're experiencing high demand right now. Please try again in a few moments.";
        } else if (String(message).includes("Could not determine")) {
            userMessage = "Sorry, we couldn't determine the language of the received email. Please ensure it is in English.";
        }
        if(outputDiv) {
            outputDiv.style.display = 'block';
            outputDiv.textContent = userMessage;
        }
    }

    function isStrictlyEnglish(text) {
        if (!text) return true;
        const englishOnlyRegex = /^[a-zA-Z0-9\s.,!?'"()&$#@*+\-/:;{}[\]\n\r%_`~@^|=<>]*$/;
        return englishOnlyRegex.test(text);
    }

    function validateInputs() {
        if (!generateButton || !receivedEmailTextarea || !userReplyTextarea) return;
        const isEnglish = isStrictlyEnglish(receivedEmailTextarea.value);
        const isUserReplyFilled = userReplyTextarea.value.trim() !== '';
        const isReceivedEmailFilled = receivedEmailTextarea.value.trim() !== '';

        if (!isEnglish) {
            if(languageWarning) languageWarning.style.display = 'block';
            generateButton.disabled = true;
        } else {
            if(languageWarning) languageWarning.style.display = 'none';
            generateButton.disabled = !(isUserReplyFilled && isReceivedEmailFilled);
        }
    }

    async function handleGenerate() {
        if (!userReplyTextarea.value.trim() || !receivedEmailTextarea.value.trim()) {
            showUserFriendlyError('Please fill in both fields before generating a reply.');
            return;
        }
        if(resultArea) resultArea.style.display = 'block';
        if(outputDiv) outputDiv.innerHTML = '';
        if(generateButton) generateButton.disabled = true;
        if(refineActionsDiv) refineActionsDiv.style.display = 'none';
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
            if(outputDiv) {
                outputDiv.style.display = 'block';
                outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
            }
            if(refineActionsDiv) refineActionsDiv.style.display = 'flex';
        } catch (error) {
            showUserFriendlyError(error.message);
        } finally {
            setLoadingState(false);
            if(generateButton) generateButton.disabled = false;
        }
    }

    async function handleRefine(textToRefine, action) {
        if(resultArea) resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if(outputDiv) outputDiv.innerHTML = '';
        if(refineActionsDiv) refineActionsDiv.style.display = 'none';
        if(generateButton) generateButton.disabled = true;
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
            if(outputDiv) outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
            if(refineActionsDiv) refineActionsDiv.style.display = 'flex';
        } catch (error) {
            showUserFriendlyError(error.message);
        } finally {
            setLoadingState(false);
            if(generateButton) generateButton.disabled = false;
        }
    }

    if (generateButton) generateButton.addEventListener('click', handleGenerate);
    if (receivedEmailTextarea) receivedEmailTextarea.addEventListener('input', validateInputs);
    if (userReplyTextarea) userReplyTextarea.addEventListener('input', validateInputs);

    // ================== TON KOMPASI MƏNTİQİ (JSON ÜÇÜN YENİLƏNİB) ==================
    const TONE_COMPASS_LIMIT = 5;
    let typingTimer;
    const doneTypingInterval = 1000;
    
    const iconMap = { 'default': '🤔', 'angry': '💣', 'excited': '☀️', 'urgent': '🔥', 'curious': '🎣', 'neutral': '⚪️', 'limit_reached': '🔒' };
    
    function getUsageData() {
        try {
            const data = JSON.parse(localStorage.getItem('proLingoUsage')) || {};
            const now = new Date();
            if (data.month !== now.getMonth() || data.year !== now.getFullYear()) {
                return { month: now.getMonth(), year: now.getFullYear(), uses: 0 };
            }
            return data;
        } catch (e) {
            const now = new Date();
            return { month: now.getMonth(), year: now.getFullYear(), uses: 0 };
        }
    }

    function incrementUsage() {
        const data = getUsageData();
        data.uses += 1;
        localStorage.setItem('proLingoUsage', JSON.stringify(data));
    }

    function hasUsesLeft() {
        const data = getUsageData();
        return data.uses < TONE_COMPASS_LIMIT;
    }
    
    function updateToneCompassUI(analysisData) {
        if (!toneCompassPopover || !popoverIcon || !popoverText) return;

        toneCompassPopover.classList.remove('limit-reached');

        if (analysisData.tone === 'limit_reached') {
            popoverIcon.textContent = iconMap.limit_reached;
            popoverText.innerHTML = `<b>Limit Reached</b><p>You've used all ${TONE_COMPASS_LIMIT} free analyses for this month.</p>`;
            toneCompassPopover.classList.add('limit-reached');
        } else if (analysisData.tone === 'default') {
            popoverIcon.textContent = iconMap.default;
            popoverText.innerHTML = '<b>Analyzing Tone...</b>';
        } else {
            popoverIcon.textContent = iconMap[analysisData.tone] || '💡';
            popoverText.innerHTML = `<b>${analysisData.reason}</b><p>${analysisData.suggestion}</p>`;
        }
        toneCompassPopover.classList.add('visible');
    }

    async function analyzeEmailTone(text) {
        if (!toneCompassPopover) return;
        if (text.trim().split(/\s+/).length < 5) {
            toneCompassPopover.classList.remove('visible');
            return;
        }
        if (!hasUsesLeft()) {
            updateToneCompassUI({ tone: 'limit_reached' });
            return;
        }
        updateToneCompassUI({ tone: 'default' });

        try {
            const response = await fetch('/.netlify/functions/analyze-tone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to get analysis.");
            }
            updateToneCompassUI(data);
            incrementUsage();
        } catch (error) {
            console.error("Tone analysis failed:", error);
            toneCompassPopover.classList.remove('visible');
        }
    }
    
    if(receivedEmailTextarea) {
        receivedEmailTextarea.addEventListener('keyup', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => { analyzeEmailTone(receivedEmailTextarea.value); }, doneTypingInterval);
        });
        receivedEmailTextarea.addEventListener('keydown', () => { clearTimeout(typingTimer); });
        receivedEmailTextarea.addEventListener('blur', () => { if(toneCompassPopover) toneCompassPopover.classList.remove('visible'); });
    }

    // --- Qalan kodlar dəyişikliksizdir ---
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    const scenarios = {
        'thank-you': 'Write a polite and professional thank-you email after a job interview for the [Job Title] position with [Company Name]. I want to reiterate my interest in the role.',
        'recommendation': "Write a formal email asking my former manager, [Manager's Name], for a letter of recommendation for a [Program/Job Title] I am applying to.",
        'apology': "Write a sincere apology email for the delay in my response regarding [Subject of Email]. Provide a brief reason and assure them it won't happen again.",
        'inquiry': 'Write a clear and concise email to inquire about [Specific Topic, e.g., the status of my application] sent on [Date].'
    };
    scenarioButtons.forEach(button => {
        button.addEventListener('click', () => {
            const scenarioKey = button.dataset.scenario;
            if (userReplyTextarea) {
                userReplyTextarea.value = scenarios[scenarioKey];
                userReplyTextarea.focus();
                validateInputs();
            }
        });
    });

    const refineButtons = document.querySelectorAll('.refine-btn');
    refineButtons.forEach(button => {
        button.addEventListener('click', () => {
            if(outputDiv) {
                const currentOutput = outputDiv.innerText;
                const refineAction = button.dataset.refine;
                if (currentOutput.trim() !== "") {
                    handleRefine(currentOutput, refineAction);
                }
            }
        });
    });

    if (receivedEmailTextarea && userReplyTextarea) {
       validateInputs();
    }

    const openModalBtn = document.getElementById('open-feedback-modal');
    const closeModalBtn = document.querySelector('.modal-close');
    const modal = document.getElementById('feedback-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const feedbackForm = document.getElementById('feedback-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    if (openModalBtn && closeModalBtn && modal && modalOverlay && feedbackForm) {
        function resetModalState() {
            if(thankYouMessage) thankYouMessage.style.display = 'none';
            if(feedbackForm) {
                feedbackForm.style.display = 'block';
                feedbackForm.reset();
            }
        }
        function openModal(e) {
            e.preventDefault();
            resetModalState();
            if(modal) modal.style.display = 'flex';
        }
        function closeModal() {
            if(modal) modal.style.display = 'none';
        }
        function handleFormSubmission(e) {
            e.preventDefault();
            const formData = new FormData(feedbackForm);
            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                if(feedbackForm) feedbackForm.style.display = 'none';
                if(thankYouMessage) thankYouMessage.style.display = 'block';
                setTimeout(closeModal, 3000);
            })
            .catch((error) => {
                alert('An error occurred. Please try again.');
                console.error(error);
            });
        }
        openModalBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        if(modalOverlay) modalOverlay.addEventListener('click', closeModal);
        feedbackForm.addEventListener('submit', handleFormSubmission);
    }
});