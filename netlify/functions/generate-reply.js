// Google Generative AI kitabxanasını layihəyə daxil edirik
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Təhlükəsiz şəkildə Netlify-da saxladığımız API açarını əldə edirik
// process.env.GOOGLE_API_KEY bizim Netlify-da yaratdığımız dəyişəndir
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.handler = async function(event, context) {
    // Brauzerdən gələn sorğunun POST metodu ilə olduğunu yoxlayırıq
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // İstifadəçinin daxil etdiyi məlumatları alırıq
        const { receivedEmail, userReply } = JSON.parse(event.body);

        // AI üçün təlimatımızı (prompt) hazırlayırıq. Bu, bizim layihəmizin "Konstitusiyası"dır.
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

        // Modeli seçirik (gemini-1.5-flash sürətli və effektivdir) və sorğunu göndəririk
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiReply = response.text();

        // Uğurlu cavabı brauzerə geri göndəririk
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply }),
        };

    } catch (error) {
        // Hər hansı bir xəta baş verərsə, onu konsolda qeyd edib brauzerə məlumat veririk
        console.error("Error generating reply:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Sorry, something went wrong on our end. Please try again." }),
        };
    }
};
