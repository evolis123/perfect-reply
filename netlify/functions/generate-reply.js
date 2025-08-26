// === netlify/functions/generate-reply.js ===
// YENİLƏNMİŞ FAYL: Etibarsız dil yoxlaması aradan qaldırıldı.

const { getAiResponse } = require('./gemini-client'); // Köməkçi faylımızı istifadə edirik.

exports.handler = async function(event) {
    console.log("--- Function generate-reply started (No language check) ---");

    try {
        const { receivedEmail, userReply, tone } = JSON.parse(event.body);
        console.log("Received data:", { receivedEmail, userReply, tone });

        // === DİL YOXLAMASI HİSSƏSİ TAMAMİLƏ SİLİNDİ ===
        // Artıq Gemini modelinin öz gücünə güvənirik.

        // === PROMPT HAZIRLANMASI (Dəyişiklik yoxdur) ===
        const prompt = `
            As a professional email assistant named 'ProLingo', your goal is to craft clear, concise, professional replies with a selected tone.
            Tone to adopt: "${tone}"
            Context: A user has received the following email:
            """
            ${receivedEmail}
            """
            Task: The user wants to reply with the following core message (the user might write this in their native language, please understand and translate it into the core English meaning):
            """
            ${userReply}
            """
            Instruction: Based on the context and task, generate a complete, ready-to-send email reply in a "${tone}" tone. The reply must be in English and grammatically perfect. Ensure it has a proper greeting and closing. Do not add any introductory text like "Here is the reply:". Just provide the raw email text.
        `;

        // === API SORĞUSU (Dəyişiklik yoxdur) ===
        const aiReply = await getAiResponse(prompt);

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        console.error("!!! CRITICAL ERROR in generate-reply:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `An error occurred: ${error.message}` }),
        };
    }
};
