// Google Generative AI kitabxanasını layihəyə daxil edirik
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
    // --- DEBUGGING ADDIM 1: Funksiya başlayırmı? ---
    console.log("--- Function generate-reply started ---");

    try {
        // --- DEBUGGING ADDIM 2: API Açarını yoxlayırıq ---
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("!!! ERROR: GOOGLE_API_KEY is not set!");
            throw new Error("API Key is missing.");
        }
        console.log("API Key found. Initializing Google AI.");
        const genAI = new GoogleGenerativeAI(apiKey);

        // --- DEBUGGING ADDIM 3: Gələn məlumatları yoxlayırıq ---
        const { receivedEmail, userReply } = JSON.parse(event.body);
        console.log("Received data:", { receivedEmail, userReply });

        // AI üçün təlimatımızı (prompt) hazırlayırıq
        const prompt = `
            As a professional email assistant named 'The Perfect Reply', your goal is to craft clear, concise, professional yet friendly replies. Your responses should always aim to move the conversation forward.
            Context: A user has received the following email:
            """
            ${receivedEmail}
            """
            Task: The user wants to reply with the following core message:
            """
            ${userReply}
            """
            Instruction: Based on the context and task, generate a complete, ready-to-send email reply. The reply should be grammatically perfect, adopt a "professional but friendly" tone, and where appropriate, suggest a next step (a "call to action"). Ensure it has a proper greeting and closing. Do not add any introductory text like "Here is the reply:". Just provide the raw email text.
        `;

        // --- DEBUGGING ADDIM 4: Modeli işə salırıq ---
        console.log("Sending request to Google AI...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiReply = response.text();
        console.log("--- Successfully received reply from Google AI ---");

        // Uğurlu cavabı brauzerə geri göndəririk
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        // --- DEBUGGING ADDIM 5: Xətanın özünü tuturuq ---
        console.error("!!! CRITICAL ERROR in function execution:", error);
        return {
            statusCode: 500,
            // Xətanın səbəbini brauzerə də göndərə bilərik (test üçün)
            body: JSON.stringify({ error: `An error occurred: ${error.message}` }),
        };
    }
};
