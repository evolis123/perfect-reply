// ===================================================================
// ===         THE PERFECT REPLY - main-v1.js (YEKUN KOD)          ===
// ===================================================================

// Bütün DOM elementlərini əvvəlcədən seçirik
const receivedEmailTextarea = document.getElementById('received-email');
const userReplyTextarea = document.getElementById('user-reply');
const generateButton = document.getElementById('generate-button');
const resultArea = document.getElementById('result-area');
const outputDiv = document.getElementById('output');
const loadingSpinner = document.getElementById('loading-spinner');
const buttonText = document.getElementById('button-text');
const languageWarning = document.getElementById('language-warning');
const refineActionsDiv = document.getElementById('refine-actions'); // Yeni refine blokunu da seçirik

// Bu funksiya verilən mətndə YALNIZ icazə verilən simvolların olub-olmadığını yoxlayır.
function isStrictlyEnglish(text) {
    if (!text) return true;
    const englishOnlyRegex = /^[a-zA-Z0-9\s.,!?'"()&$#@*+\-/:;{}[\]\n\r%_`~@^|=<>]*$/;
    return englishOnlyRegex.test(text);
}

// Düymənin aktiv/passiv olmasını təyin edən funksiya
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

// Əsas "Generate" düyməsinə kliklədikdə
generateButton.addEventListener('click', async () => {
    const receivedEmail = receivedEmailTextarea.value;
    const userReply = userReplyTextarea.value;
    const selectedTone = document.querySelector('input[name="tone"]:checked').value;

    if (!receivedEmail || !userReply) {
        alert('Please fill in both fields.');
        return;
    }
    
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
    refineActionsDiv.style.display = 'none'; // YENİ ƏLAVƏ EDİLDİ: Təkmilləşdirmə düymələrini gizlədirik

    try {
        const response = await fetch('/.netlify/functions/generate-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receivedEmail, userReply, tone: selectedTone }),
        });
        const data = await response.json();
        
        if (response.ok) {
            outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>');
            refineActionsDiv.style.display = 'flex'; // YENİ ƏLAVƏ EDİLDİ: Nəticə gələndə düymələri göstəririk
        } else {
            throw new Error(data.error || 'An unknown error occurred.');
        }

    } catch (error) {
        outputDiv.textContent = `An error occurred: ${error.message}`;
        console.error('Error:', error);
    } finally {
        loadingSpinner.style.display = 'none';
        buttonText.textContent = 'Generate The Perfect Reply';
        validateInputs();
    }
});

// Təkmilləşdirmə üçün süni intellektə sorğu göndərən funksiya
async function handleRefine(textToRefine, action) {
    console.log(`Refining text to be ${action}...`);
    
    loadingSpinner.style.display = 'block';
    outputDiv.style.display = 'none';
    refineActionsDiv.style.display = 'none';

    let prompt;
    switch (action) {
        case 'shorter':
            prompt = `Make the following text shorter and more concise:\n\n"${textToRefine}"`;
            break;
        case 'formal':
            prompt = `Rewrite the following text in a more formal and professional tone:\n\n"${textToRefine}"`;
            break;
        case 'friendly':
            prompt = `Rewrite the following text in a more friendly and approachable tone:\n\n"${textToRefine}"`;
            break;
        default:
            console.error('Unknown refine action:', action);
            return;
    }
    
    try {
        // !!! DİQQƏT: BU HİSSƏ SƏNİN NETLIFY FUNKSİYANA UYĞUNLAŞDIRILMALIDIR !!!
        // Çox güman ki, yeni bir Netlify funksiyası yaratmaq lazım gələcək (məs, /generate-refinement)
        // Nümunə:
        const response = await fetch('/.netlify/functions/generate-reply', { // Eyni funksiyanı istifadə edirik amma prompt fərqlidir
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ userReply: prompt, tone: 'neutral' }), // Sadəcə prompt göndəririk
        });
        const data = await response.json();
        if(!response.ok) throw new Error(data.error || 'Refinement failed.');
        
        outputDiv.innerHTML = data.reply.replace(/\n/g, '<br>');

    } catch (error) {
        console.error('Error during refinement:', error);
        outputDiv.innerText = `Sorry, something went wrong during refinement: ${error.message}`;
    } finally {
        loadingSpinner.style.display = 'none';
        outputDiv.style.display = 'block';
        refineActionsDiv.style.display = 'flex';
    }
}

// Bütün event listener-ləri DOM yükləndikdən sonra qururuq
document.addEventListener('DOMContentLoaded', () => {
    // Düyməni başlanğıcda qeyri-aktiv et
    generateButton.disabled = true;

    // Hər iki mətn qutusuna yazıldıqca yoxlama
    receivedEmailTextarea.addEventListener('input', validateInputs);
    userReplyTextarea.addEventListener('input', validateInputs);

    // Ssenari Düymələri
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
            const scenarioText = scenarios[scenarioKey];
            if (scenarioText) {
                userReplyTextarea.value = scenarioText;
                userReplyTextarea.focus();
                validateInputs(); // Düyməni aktiv etmək üçün yoxlamanı işə sal
            }
        });
    });

    // Təkmilləşdirmə Düymələri
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
});