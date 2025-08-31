// --- analyze-tone.js ---
// Bu, "Ton Kompası" üçün backend funksiyasının prototipidir.
// Hələlik, bu fayl sadəcə interfeysin işlədiyini yoxlamaq üçündür.
// Gələcəkdə biz bura həqiqi AI analiz məntiqini əlavə edəcəyik.

exports.handler = async function(event, context) {
    try {
        // const { text } = JSON.parse(event.body);

        // GƏLƏCƏKDƏ: Burada OpenAI və ya başqa bir AI xidməti çağırılacaq
        // və verilən mətnin tonu analiz ediləcək.
        
        // Hələlik, test üçün həmişə eyni, müsbət bir cavab qaytaraq:
        const possibleTones = ['angry', 'excited', 'urgent', 'curious', 'neutral'];
        const randomTone = possibleTones[Math.floor(Math.random() * possibleTones.length)];

        return {
            statusCode: 200,
            body: JSON.stringify({ tone: randomTone })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to analyze tone' })
        };
    }
};
