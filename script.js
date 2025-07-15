const receivedEmailTextarea = document.getElementById('received-email');
const userReplyTextarea = document.getElementById('user-reply');
const generateButton = document.getElementById('generate-button');
const resultArea = document.getElementById('result-area');
const outputDiv = document.getElementById('output');
const loadingSpinner = document.getElementById('loading-spinner');
const buttonText = document.getElementById('button-text');
const languageWarning = document.getElementById('language-warning');

/**
 * YENİLƏNMİŞ VƏ DAHA SƏRT DİL YOXLAMASI FUNKSİYASI
 * Bu funksiya verilən mətndə YALNIZ icazə verilən simvolların olub-olmadığını yoxlayır.
 * Azərbaycan və ya digər əlifbaların xüsusi hərfləri (ə, ö, ü, ç, ş, ı, ğ) dərhal mətni "qeyri-ingilis" edəcək.
 */
function isStrictlyEnglish(text) {
    if (!text) return true; // Boş mətn problem deyil
    // Bu regular expression yalnız göstərilən simvollara icazə verir. Başqa hər şey səhv sayılır.
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
        if (isUserReplyFilled && isReceivedEmailFilled) {
            generateButton.disabled = false;
        } else {
            generateButton.disabled = true;
        }
    }
}

// Hər iki qutuya yazı yazıldıqca yoxlamanı işə sal
receivedEmailTextarea.addEventListener('input', validateInputs);
userReplyTextarea.addEventListener('input', validateInputs);

// Düyməyə basılanda
generateButton.addEventListener('click', async () => {
    const receivedEmail = receivedEmailTextarea.value;
    const userReply = userReplyTextarea.value;
    const selectedTone = document.querySelector('input[name="tone"]:checked').value;

    if (!receivedEmail || !userReply) {
        alert('Please fill in both fields.');
        return;
    }
    
    // SON QALA: Düyməyə basanda son dəfə sərt yoxlama
    if (!isStrictlyEnglish(receivedEmail)) {
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
        // Düymənin vəziyyətini yenidən yoxla
        validateInputs();
    }
});

// Səhifə ilk dəfə yüklənəndə düyməni qeyri-aktiv et
document.addEventListener('DOMContentLoaded', () => {
    generateButton.disabled = true;
});