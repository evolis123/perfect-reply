// ===================================================================
// ===         THE PERFECT REPLY - v2.0 (KULLANICI DENEYİMİ İYİLEŞTİRMELERİ)          ===
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Tüm DOM elementlerini seçiyoruz
    const receivedEmailTextarea = document.getElementById('received-email');
    const userReplyTextarea = document.getElementById('user-reply');
    const generateButton = document.getElementById('generate-button');
    const resultArea = document.getElementById('result-area');
    const outputDiv = document.getElementById('output');
    const loadingSpinner = document.getElementById('loading-spinner');
    const buttonText = document.getElementById('button-text');
    const languageWarning = document.getElementById('language-warning');
    const refineActionsDiv = document.getElementById('refine-actions');

    // Dinamik yükleme mesajları
    const loadingMessages = [
        "Analyzing the email...",
        "Crafting the perfect sentences...",
        "Polishing the result...",
        "Almost there..."
    ];
    let messageInterval;

    // Yükleme animasyonunu başlatan fonksiyon
    function startLoadingAnimation() {
        let messageIndex = 0;
        loadingSpinner.style.display = 'block';
        buttonText.textContent = loadingMessages[messageIndex];
        
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            buttonText.textContent = loadingMessages[messageIndex];
        }, 2000); // Her 2 saniyede bir mesajı değiştir
    }

    // Yükleme animasyonunu durduran fonksiyon
    function stopLoadingAnimation() {
        clearInterval(messageInterval);
        loadingSpinner.style.display = 'none';
        buttonText.textContent = 'Generate The Perfect Reply';
    }

    // Kullanıcı dostu hata mesajı gösteren fonksiyon
    function showUserFriendlyError(error) {
        console.error("Internal Error:", error); // Hatayı kendi analizimiz için konsola yazdırıyoruz
        let userMessage = "Sorry, something unexpected happened. Please try again.";

        if (error.message.includes("503") || error.message.includes("overloaded")) {
            userMessage = "We're experiencing high demand right now. Please try again in a few moments.";
        } else if (error.message.includes("Could not determine")) {
             userMessage = "Sorry, we couldn't determine the language of the received email. Please ensure it is in English.";
        }
        
        outputDiv.style.display = 'block';
        outputDiv.textContent = userMessage;
    }

    // Diğer fonksiyonlar (isStrictlyEnglish, validateInputs) burada aynı kalıyor...
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


    // Ana "Generate" fonksiyonu (YENİLENDİ)
    async function handleGenerate() {
        // ... (giriş kontrolleri aynı kalıyor)
        if (!userReplyTextarea.value.trim() || !receivedEmailTextarea.value.trim()) {
             alert('Please fill in both fields.');
             return;
        }

        resultArea.style.display = 'block';
        outputDiv.innerHTML = '';
        generateButton.disabled = true;
        refineActionsDiv.style.display = 'none';
        startLoadingAnimation();

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
            
            if (!response.ok) {
                // Hata objesini oluşturup fırlatıyoruz
                const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            outputDiv.style.display = 'block';
            outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
            refineActionsDiv.style.display = 'flex';

        } catch (error) {
            showUserFriendlyError(error);
        } finally {
            stopLoadingAnimation();
            validateInputs();
        }
    }

    // "Refine" fonksiyonu (YENİLENDİ)
    async function handleRefine(textToRefine, action) {
        console.log(`Refining text to be ${action}...`);
        
        outputDiv.style.display = 'none';
        refineActionsDiv.style.display = 'none';
        startLoadingAnimation(); // Burada da animasyonu başlatıyoruz

        const receivedEmail = receivedEmailTextarea.value;
        let prompt;
        // ... (switch case aynı kalıyor)
        switch (action) {
            case 'shorter': prompt = `Make the following text shorter and more concise:\n\n"${textToRefine}"`; break;
            case 'formal': prompt = `Rewrite the following text in a more formal and professional tone:\n\n"${textToRefine}"`; break;
            case 'friendly': prompt = `Rewrite the following text in a more friendly and approachable tone:\n\n"${textToRefine}"`; break;
            default: console.error('Unknown refine action:', action); stopLoadingAnimation(); return;
        }
        
        try {
            const response = await fetch('/.netlify/functions/generate-reply', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ receivedEmail: receivedEmail, userReply: prompt, tone: 'neutral' }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            outputDiv.style.display = 'block';
            outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
            refineActionsDiv.style.display = 'flex';

        } catch (error) {
            showUserFriendlyError(error);
        } finally {
        stopLoadingAnimation();
        // === YENİ ƏLAVƏ EDİLƏN ƏMR BUDUR ===
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

    // === EVENT LISTENERS (Olay dinleyicileri) ===
    generateButton.addEventListener('click', handleGenerate);
    // ... (diğer tüm event listener'lar önceki gibi kalıyor)
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

    // Sayfa ilk yüklendiğinde doğrulamayı çalıştır
    validateInputs();
});