// === refine-reply.js ===
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
    console.log("--- Function refine-reply started ---");
    try {
        const { textToRefine, action } = JSON.parse(event.body);
        if (!textToRefine || !action) {
            throw new Error("Missing textToRefine or action.");
        }

        console.log(`Refining text. Action: ${action}`);

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) { throw new Error("API Key is missing."); }
        const genAI = new GoogleGenerativeAI(apiKey);

        let instruction = "";
        switch (action) {
            case 'shorter':
                instruction = "Make the following email reply shorter and more concise. Keep the core meaning and professional tone.";
                break;
            case 'formal':
                instruction = "Rewrite the following email reply in a significantly more formal and corporate tone.";
                break;
            case 'friendly':
                instruction = "Rewrite the following email reply in a more friendly, warm, and approachable tone.";
                break;
            default:
                throw new Error(`Unknown refine action: ${action}`);
        }

        const prompt = `${instruction}\n\n"""\n${textToRefine}\n"""`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const refinedReply = result.response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: refinedReply }),
        };

    } catch (error) {
        console.error("!!! CRITICAL ERROR in refine-reply:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `An error occurred: ${error.message}` }),
        };
    }
};