// === main-v1.js ===
// Tora tərəfindən yazılmış ən mükəmməl, təkrarsız və təkmil versiya.
// YENİLƏNMİŞ: Ton Kompası məntiqi əlavə edildi.

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

    // ================== YENİ: TON KOMPASI ELEMENTLƏRİ ==================
    const toneCompassCard = document.getElementById('tone-compass-result');
    const toneIcon = toneCompassCard.querySelector('.tone-icon');
    const toneTitle = toneCompassCard.querySelector('.tone-title');
    const toneDescription = toneCompassCard.querySelector('.tone-description');
    const premiumTag = toneCompassCard.querySelector('.premium-tag');
    // =================================================================

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
        //... Bu funksiya dəyişməz qalıb ...
    }

    async function handleRefine(textToRefine, action) {
        //... Bu funksiya dəyişməz qalıb ...
    }

    // --- Mövcud event listener-lər ---
    if (generateButton) generateButton.addEventListener('click', handleGenerate);
    if (receivedEmailTextarea) receivedEmailTextarea.addEventListener('input', validateInputs);
    if (userReplyTextarea) userReplyTextarea.addEventListener('input', validateInputs);
    
    // ... Scenario və Refine buttons logikası dəyişməz qalıb ...
    validateInputs();


    // =================================================================
    // ================== YENİ: TON KOMPASI MƏNTİQİ ==================
    // =================================================================

    const TONE_COMPASS_LIMIT = 5; // Aylıq pulsuz limit
    let typingTimer; // İstifadəçinin yazmağı dayandırdığını bilmək üçün
    const doneTypingInterval = 1000; // 1 saniyə sonra analizi başlat

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
        // Əgər yeni aya keçmişiksə, sayğacı sıfırla
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
        
        // Limit bitəndə "Premium" etiketini gizlət
        premiumTag.style.display = (toneKey === 'limit_reached') ? 'none' : 'inline-block';
        
        toneCompassCard.style.display = 'flex';
    }

    async function analyzeEmailTone(text) {
        if (text.split(' ').length < 5) { // Çox qısa mətnləri analiz etmə
            toneCompassCard.style.display = 'none';
            return;
        }

        if (!hasUsesLeft()) {
            updateToneCompassUI('limit_reached');
            return;
        }

        updateToneCompassUI('default'); // "Analiz edilir..." vəziyyətini göstər

        try {
            // HƏQİQİ BACKEND ÇAĞIRIŞI BURADA OLACAQ
            // const response = await fetch('/.netlify/functions/analyze-tone', {
            //     method: 'POST',
            //     body: JSON.stringify({ text: text })
            // });
            // const data = await response.json();
            // const tone = data.tone;
            
            // --- HƏLƏLİK TEST ÜÇÜN SİMULYASİYA ---
            await new Promise(resolve => setTimeout(resolve, 1500)); // Gecikməni simulyasiya et
            const tones = ['angry', 'excited', 'urgent', 'curious', 'neutral'];
            const randomTone = tones[Math.floor(Math.random() * tones.length)];
            const tone = randomTone; 
            // --- SİMULYASİYA SONU ---

            updateToneCompassUI(tone);
            incrementUsage();

        } catch (error) {
            console.error("Tone analysis failed:", error);
            toneCompassCard.style.display = 'none'; // Xəta olarsa, kartı gizlət
        }
    }
    
    // İstifadəçi email yazmağı dayandırdıqda analizi başlat
    receivedEmailTextarea.addEventListener('keyup', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            analyzeEmailTone(receivedEmailTextarea.value);
        }, doneTypingInterval);
    });
    
    receivedEmailTextarea.addEventListener('keydown', () => {
        clearTimeout(typingTimer);
    });

    // =================================================================
    // =============== MODAL VƏ NETLIFY FORM LOGİKASI ===============
    // =================================================================
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

