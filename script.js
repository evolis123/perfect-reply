const receivedEmailTextarea = document.getElementById('received-email');
const userReplyTextarea = document.getElementById('user-reply');
const generateButton = document.getElementById('generate-button');
const resultArea = document.getElementById('result-area');
const outputDiv = document.getElementById('output');
const loadingSpinner = document.getElementById('loading-spinner');
const buttonText = document.getElementById('button-text');

// YENİ: Dil xəbərdarlığı üçün element
const languageWarning = document.getElementById('language-warning');

// YENİ: İngilis dili yoxlaması üçün sadə funksiya
// Bu funksiya yalnız əsas Latın əlifbası və ümumi simvolları yoxlayır.
// Ə, Ö, Ü, Ç, Ş, İ, Ğ kimi hərflər və ya kiril/ərəb əlifbaları daxil edilərsə "false" qaytaracaq.
function isLikelyEnglish(text) {
    // Boş mətni ingilis dili kimi qəbul edirik ki, xəta verməsin
    if (!text.trim()) return true; 
    // Regular expression to check for characters not common in English
    const nonEnglishRegex = /[^a-zA-Z0-9\s.,!?'"()&$#@*+\-/=_:;{}\[\]\n\r%]/;
    return !nonEnglishRegex.test(text);
}

// YENİ: Email sahəsinə yazı yazıldıqca dili yoxlamaq üçün event listener
receivedEmailTextarea.addEventListener('input', () => {
    const isEnglish = isLikelyEnglish(receivedEmailTextarea.value);
    if (isEnglish) {
        languageWarning.style.display = 'none';
        // Yalnız hər iki sahə dolu olduqda düyməni aktiv edirik
        if (userReplyTextarea.value.trim()) {
            generateButton.disabled = false;
        }
    } else {
        languageWarning.style.display = 'block';
        generateButton.disabled = true;
    }
});


generateButton.addEventListener('click', async () => {
    const receivedEmail = receivedEmailTextarea.value;
    const userReply = userReplyTextarea.value;

    // YENİ: Ton seçimini əldə edirik
    const selectedTone = document.querySelector('input[name="tone"]:checked').value;

    if (!receivedEmail || !userReply) {
        alert('Please fill in both fields.');
        return;
    }
    
    // YENİ: Düyməyə basanda son dəfə dil yoxlaması
    if (!isLikelyEnglish(receivedEmail)) {
        languageWarning.style.display = 'block';
        alert('The free version only supports emails written in English.');
        return;
    }

    resultArea.style.display = 'block';
    loadingSpinner.style.display = 'block';
    outputDiv.innerHTML = ''; 
    generateButton.disabled = true;
    buttonText.textContent = 'Generating...';

    try {
        const response = await fetch('/.netlify/functions/generate-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // YENİ: Sorğuya "tone" məlumatını əlavə edirik
            body: JSON.stringify({ receivedEmail, userReply, tone: selectedTone }),
        });
        const data = await response.json();
        
        if (response.ok) {
            outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
        } else {
            throw new Error(data.error || 'An unknown error occurred.');
        }

    } catch (error) {
        outputDiv.textContent = `An error occurred: ${error.message}`;
        console.error('Error:', error);
    } finally {
        loadingSpinner.style.display = 'none';
        generateButton.disabled = false;
        buttonText.textContent = 'Generate The Perfect Reply';
    }
});