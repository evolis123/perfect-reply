// --- analyze-tone.js ---
// Bu, "Ton Kompası" üçün Gemini AI ilə işləyən son, stabil versiyadır. (Robust JSON Parsing ilə)

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { text } = JSON.parse(event.body);

        if (!text || text.trim().length < 10) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Not enough text to analyze' }) };
        }
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a professional communication coach named ProLingo. Your task is to analyze the emotional tone of an email and provide a structured analysis in a valid JSON format.

The JSON object must have these exact three keys: "tone", "reason", and "suggestion".
1.  "tone": Classify the email into ONE of the following categories: 'neutral', 'excited', 'urgent', 'angry', 'curious'.
2.  "reason": Provide a very brief, one-sentence explanation for your classification.
3.  "suggestion": Offer a short, actionable strategic tip for the user on how to reply.

Analyze the following email text and provide your response ONLY in the specified JSON format. Do not add any text before or after the JSON object.

Email text: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const responseText = response.text().trim();
        
        // --- ƏSAS DÜZƏLİŞ BURADADIR ---
        // AI-dan gələn cavabın içindən təmiz JSON-u çıxarırıq
        const startIndex = responseText.indexOf('{');
        const endIndex = responseText.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) {
            console.error("Could not find JSON object in AI response:", responseText);
            throw new Error("AI did not return a JSON object.");
        }

        const jsonString = responseText.substring(startIndex, endIndex + 1);
        let analysisResult;
        try {
            analysisResult = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse extracted JSON:", jsonString);
            throw new Error("AI returned a malformed JSON object.");
        }

        return {
            statusCode: 200,
            body: JSON.stringify(analysisResult)
        };

    } catch (error) {
        console.error("AI analysis error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'AI function crashed!', 
                errorMessage: error.message
            })
        };
    }
};