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

        const prompt = `You are a precise linguistic analysis model. Your task is to analyze the emotional tone of the provided email text and categorize it into one of five predefined categories.

Here are the definitions for each category:
- 'neutral': The text is standard, professional, informational, or lacks strong emotion. (e.g., "Following up on our meeting.", "Please find the document attached.")
- 'excited': The text expresses clear happiness, enthusiasm, or positive anticipation. (e.g., "Great news!", "I'm looking forward to working with you.")
- 'urgent': The text demands immediate attention or indicates a time-sensitive issue. (e.g., "Urgent action required", "The deadline is today.")
- 'angry': The text expresses clear dissatisfaction, frustration, or complaint. (e.g., "I am very disappointed.", "This is unacceptable.")
- 'curious': The text is primarily asking for information, clarification, or shows a desire to learn more. (e.g., "Could you tell me more about...?", "I have a few questions.")

Analyze the following email text. If no strong emotion is present, default to 'neutral'. If multiple tones seem to apply, choose the single most dominant one.

Your final output MUST BE only one of the keywords listed above. Do not provide explanations.

Email text: "${text}"`;

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