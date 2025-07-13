exports.handler = async function(event, context) {
    const { receivedEmail, userReply } = JSON.parse(event.body);

    await new Promise(resolve => setTimeout(resolve, 2000)); // Test üçün 2 saniyəlik gözləmə

    const testReply = `
    Dear [Name],

    Thank you for your email.
    I have reviewed your proposal and I would like to say that "${userReply}".

    Best regards,
    [Your Name]

    ---
    (This is a test response until the real API is connected)
    `;

    return {
        statusCode: 200,
        body: JSON.stringify({ reply: testReply }),
    };
};