// === netlify/functions/gemini-client.js ===
// YENİ KÖMƏKÇİ FAYL: Bu fayl Google Gemini API ilə bütün əlaqəni mərkəzləşdirir.

const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Verilən prompt ilə Gemini API-a sorğu göndərir və cavabı qaytarır.
 * @param {string} prompt - Süni intellektə göndəriləcək təlimat.
 * @returns {Promise<string>} - Süni intellektin yaratdığı mətn cavabı.
 */
async function getAiResponse(prompt) {
    // API açarını mühit dəyişənindən (environment variable) götürürük.
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        // Açar tapılmasa, dərhal xəta veririk.
        console.error("!!! CRITICAL: GOOGLE_API_KEY is missing!");
        throw new Error("API Key is missing.");
    }

    // Google AI klientini başladırıq.
    const genAI = new GoogleGenerativeAI(apiKey);
    // İstifadə edəcəyimiz modeli seçirik.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Məzmunu yaradırıq və nəticəni gözləyirik.
    const result = await model.generateContent(prompt);
    // Nəticənin mətn hissəsini qaytarırıq.
    return result.response.text();
}

// Bu funksiyanı digər fayllarda istifadə etmək üçün export edirik.
module.exports = { getAiResponse };
