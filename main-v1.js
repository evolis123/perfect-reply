// === main-v1.js ===
// Tora tərəfindən yazılmış ən mükəmməl, təkrarsız və təkmil versiya.
// YENİLƏNMİŞ: Ton Kompası məntiqi və Şablon düymələri bərpa edildi.

document.addEventListener('DOMContentLoaded', () => {
    // --- Bütün DOM elementlərini seçirik ---
    const receivedEmailTextarea = document.getElementById('received-email');
    const userReplyTextarea = document.getElementById('user-reply');
    const generateButton = document.getElementById('generate-button');
    const resultArea = document.getElementById('result-area');
    const outputDiv = document.getElementById('output');
    const loadingSpinner = document.getElementById('loading-spinner');
    const buttonText = document.getElementById('button-text');
    const languageWarning = document.getElementById('language-warning');
    const refineActionsDiv = document.getElementById('refine-actions');

    // --- TON KOMPASI ELEMENTLƏRİ ---
    const toneCompassCard = document.getElementById('tone-compass-result');
    const toneIcon = toneCompassCard.querySelector('.tone-icon');
    const toneTitle = toneCompassCard.querySelector('.tone-title');
    const toneDescription = toneCompassCard.querySelector('.tone-description');
    const premiumTag = toneCompassCard.querySelector('.premium-tag');

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
        if (!generateButton) return;
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
    
    // --- EVENT LISTENERS ---
    if (generateButton) generateButton.addEventListener('click', handleGenerate);
    if (receivedEmailTextarea) receivedEmailTextarea.addEventListener('input', validateInputs);
    if (userReplyTextarea) userReplyTextarea.addEventListener('input', validateInputs);

    // BƏRPA EDİLDİ: Şablon düymələrinin məntiqi
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

    // BƏRPA EDİLDİ: "Refine" düymələrinin məntiqi
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

    // ================== TON KOMPASI MƏNTİQİ ==================
    const TONE_COMPASS_LIMIT = 5;
    let typingTimer;
    const doneTypingInterval = 1000;

    const toneMap = {
        'default': { icon: '🤔', title: 'Analyzing Tone...', description: 'Just a moment while we read the room...'},
        'angry': { icon: '💣', title: 'Minefield', description: 'Proceed with caution. The sender seems displeased or angry.' },
        'excited': { icon: '☀️', title: 'Positive Vibe', description: 'The sender is enthusiastic. A great opportunity to collaborate!' },
        'urgent': { icon: '🔥', title: 'High Priority', description: 'This requires your immediate attention. Act quickly.' },
        'curious': { icon: '🎣', title: 'Hooked', description: 'They are interested and waiting for more information from you.' },
        'neutral': { icon: '⚪️', title: 'Neutral', description: 'The tone is standard and professional. Respond calmly.'},
        'limit_reached': { icon: '🔒', title: 'Monthly Limit Reached', description: `You've used your ${TONE_COMPASS_LIMIT} free analyses. Upgrade to Premium for unlimited insights.`}
    };
    
    function getUsageData() {
        const data = JSON.parse(localStorage.getItem('proLingoUsage')) || {};
        const now = new Date();
        if (data.month !== now.getMonth() || data.year !== now.getFullYear()) {
            return { month: now.getMonth(), year: now.getFullYear(), uses: 0 };
        }
        return data;
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
    
    function updateToneCompassUI(toneKey) {
        const toneData = toneMap[toneKey] || toneMap['neutral'];
        toneIcon.textContent = toneData.icon;
        toneTitle.textContent = toneData.title;
        toneDescription.textContent = toneData.description;
        premiumTag.style.display = (toneKey === 'limit_reached') ? 'none' : 'inline-block';
        toneCompassCard.style.display = 'flex';
    }

    async function analyzeEmailTone(text) {
        if (text.split(' ').length < 5) {
            toneCompassCard.style.display = 'none';
            return;
        }

        if (!hasUsesLeft()) {
            updateToneCompassUI('limit_reached');
            return;
        }

        updateToneCompassUI('default');

        try {
            const response = await fetch('/.netlify/functions/analyze-tone', {
                 method: 'POST',
                 body: JSON.stringify({ text: text })
            });
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            const tone = data.tone;
            
            updateToneCompassUI(tone);
            incrementUsage();

        } catch (error) {
            console.error("Tone analysis failed:", error);
            toneCompassCard.style.display = 'none';
        }
    }
    
    receivedEmailTextarea.addEventListener('keyup', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            analyzeEmailTone(receivedEmailTextarea.value);
        }, doneTypingInterval);
    });
    
    receivedEmailTextarea.addEventListener('keydown', () => {
        clearTimeout(typingTimer);
    });

    // =============== MODAL VƏ NETLIFY FORM LOGİKASI ===============
    const openModalBtn = document.getElementById('open-feedback-modal');
    const closeModalBtn = document.querySelector('.modal-close');
    const modal = document.getElementById('feedback-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const feedbackForm = document.getElementById('feedback-form');
    const thankYouMessage = document.getElementById('thank-you-message');

    if (openModalBtn && closeModalBtn && modal && modalOverlay && feedbackForm) {
        function resetModalState() {
            thankYouMessage.style.display = 'none';
            feedbackForm.style.display = 'block';
            feedbackForm.reset();
        }

        function openModal(e) {
            e.preventDefault();
            resetModalState();
            modal.style.display = 'flex';
        }

        function closeModal() {
            modal.style.display = 'none';
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
                feedbackForm.style.display = 'none';
                thankYouMessage.style.display = 'block';
                setTimeout(closeModal, 3000);
            })
            .catch((error) => {
                alert('An error occurred while submitting your feedback. Please try again.');
                console.error(error);
            });
        }

        openModalBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        feedbackForm.addEventListener('submit', handleFormSubmission);
    }
});

