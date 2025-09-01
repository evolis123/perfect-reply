// --- analyze-tone.js ---
// Bu, "Ton Kompası" üçün Gemini AI ilə işləyən real backend funksiyasiyasıdır.

const { GoogleGenerativeAI } = require("@google/generative-ai");

// API açarını təhlükəsiz şəkildə Netlify Mühit Dəyişənlərindən (Environment Variables) götürürük
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.handler = async function(event, context) {
    // Frontend-dən POST sorğusu gəlmirsə, prosesi dayandır
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { text } = JSON.parse(event.body);

        // Əgər mətn boşdursa və ya çox qısadırsa, analiz etmə
        if (!text || text.trim().length < 10) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Not enough text to analyze' })
            };
        }
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyze the emotional tone of the following email text. Respond with ONLY ONE of these keywords: 'angry', 'excited', 'urgent', 'curious', or 'neutral'. Do not add any other words, explanations, or punctuation. Email text: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let tone = response.text().trim().toLowerCase();

        // AI-ın cavabının bizim gözlədiyimiz formatda olduğundan əmin oluruq
        const possibleTones = ['angry', 'excited', 'urgent', 'curious', 'neutral'];
        if (!possibleTones.includes(tone)) {
            console.warn(`Unexpected AI response: '${tone}'. Defaulting to 'neutral'.`);
            tone = 'neutral'; // Gözlənilməz cavab gələrsə, standart "neutral" tona keç
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ tone: tone })
        };

    } catch (error) {
        console.error("AI analysis error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to analyze tone due to an internal AI error.' })
        };
    }
};