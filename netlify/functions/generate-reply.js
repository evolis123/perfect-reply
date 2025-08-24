// === netlify/functions/generate-reply.js ===
// YENİLƏNMİŞ FAYL: Artıq daha qısa və səliqəlidir.

const { getAiResponse } = require('./gemini-client'); // Yeni köməkçi faylımızı daxil edirik.
const langdetect = require('langdetect');

exports.handler = async function(event) {
    console.log("--- Function generate-reply started ---");

    try {
        const { receivedEmail, userReply, tone } = JSON.parse(event.body);
        console.log("Received data:", { receivedEmail, userReply, tone });

        // === LİNQVİSTİK YOXLAMA ===
        try {
            const detections = langdetect.detect(receivedEmail);
            const mainLanguage = detections[0];

            if (mainLanguage.lang !== 'en') {
                console.error(`Linguistic validation failed: Detected language is "${mainLanguage.lang}".`);
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "The received email must be in English." }),
                };
            }
            console.log(`Linguistic validation passed: ${mainLanguage.lang}`);
        } catch (langError) {
            console.error("Linguistic validation failed: Could not detect language.", langError.message);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Could not determine the language of the received email." }),
            };
        }

        // === PROMPT HAZIRLANMASI ===
        const prompt = `
            As a professional email assistant named 'ProLingo', your goal is to craft clear, concise, professional replies with a selected tone.
            Tone to adopt: "${tone}"
            Context: A user has received the following email:
            """
            ${receivedEmail}
            """
            Task: The user wants to reply with the following core message:
            """
            ${userReply}
            """
            Instruction: Based on the context and task, generate a complete, ready-to-send email reply in a "${tone}" tone. The reply must be grammatically perfect. Ensure it has a proper greeting and closing. Do not add any introductory text like "Here is the reply:". Just provide the raw email text.
        `;

        // === API SORĞUSU (YENİ, SADƏLƏŞDİRİLMİŞ YOL) ===
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
