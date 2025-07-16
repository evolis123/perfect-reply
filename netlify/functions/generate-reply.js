// Gərəkli kitabxanaları layihəyə daxil edirik
const { GoogleGenerativeAI } = require("@google/generative-ai");
const langdetect = require('langdetect');

exports.handler = async function(event, context) {
    console.log("--- Function generate-reply started with LINGUISTIC CHECK ---");

    try {
        const { receivedEmail, userReply, tone } = JSON.parse(event.body);
        console.log("Received data:", { receivedEmail, userReply, tone });

        // =================================================================
        // ===            YENİ VƏ AĞILLI LİNQVİSTİK YOXLAMA             ===
        // =================================================================
        try {
            // Mətnin dilini təyin edirik
            const detections = langdetect.detect(receivedEmail);
            const mainLanguage = detections[0]; // Ən yüksək ehtimallı nəticəni götürürük

            if (mainLanguage.lang !== 'en') {
                console.error(`!!! LINGUISTIC VALIDATION FAILED: Detected language is "${mainLanguage.lang}", not "en".`);
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "The received email must be in English. Linguistic validation failed." }),
                };
            }
             console.log(`Linguistic validation passed. Detected language: ${mainLanguage.lang} with probability ${mainLanguage.prob}`);

        } catch (langError) {
            // `langdetect` dili təyin edə bilmədikdə xəta verir (məsələn, mətn çox qısa olduqda)
            console.error("!!! LINGUISTIC VALIDATION FAILED: Could not detect language.", langError.message);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Could not determine the language of the received email. Please ensure it is in English." }),
            };
        }
        // =================================================================
        // ===                  YENİ HİSSƏNİN SONU                       ===
        // =================================================================

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) { throw new Error("API Key is missing."); }
        const genAI = new GoogleGenerativeAI(apiKey);

        const prompt = `
            As a professional email assistant named 'The Perfect Reply', your goal is to craft clear, concise, professional replies with a selected tone.
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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const aiReply = result.response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        console.error("!!! CRITICAL ERROR in function execution:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `An error occurred: ${error.message}` }),
        };
    }
};