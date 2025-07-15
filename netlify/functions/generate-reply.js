// Google Generative AI kitabxanasını layihəyə daxil edirik
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Bu funksiya frontend-dəki ilə EYNİDİR. Məqsəd serverdə də eyni yoxlamanı
 * apararaq 100% təhlükəsizliyi təmin etməkdir.
 * Yalnız standart ingilis (latın) simvollarını qəbul edir.
 */
function isStrictlyEnglish(text) {
    if (!text) return true;
    const englishOnlyRegex = /^[a-zA-Z0-9\s.,!?'"()&$#@*+\-/:;{}[\]\n\r%_`~@^|=<>]*$/;
    return englishOnlyRegex.test(text);
}


exports.handler = async function(event, context) {
    console.log("--- Function generate-reply started ---");

    try {
        const { receivedEmail, userReply, tone } = JSON.parse(event.body);
        console.log("Received data:", { receivedEmail, userReply, tone });

        // =================================================================
        // ===                  YENİ ƏLAVƏ EDİLƏN HİSSƏ                  ===
        // =================================================================
        // Bu, server tərəfindəki son və ən etibarlı yoxlamadır.
        if (!isStrictlyEnglish(receivedEmail)) {
            console.error("!!! VALIDATION FAILED: Received email is not in English.");
            return {
                statusCode: 400, // 400 "Bad Request" deməkdir
                body: JSON.stringify({ error: "The free version only supports emails written in English. Server-side validation failed." }),
            };
        }
        console.log("Language validation passed successfully.");
        // =================================================================
        // ===                  YENİ HİSSƏNİN SONU                       ===
        // =================================================================


        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("!!! ERROR: GOOGLE_API_KEY is not set!");
            throw new Error("API Key is missing.");
        }
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

        console.log("Sending request to Google AI...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiReply = response.text();
        console.log("--- Successfully received reply from Google AI ---");

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