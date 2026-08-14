export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method Not Allowed' });

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const message = body?.message || "";
        const context = body?.context || "";

        if (!message) throw new Error("Pesan kosong.");

        const apiKey = "SentraKarsa123";

        // Fitur Generate Gambar
        const imageRegex = /(?:buatkan|gambarkan|generate|lukiskan).*(?:gambar|foto|ilustrasi|lukisan)\s+(.*)/i;
        const match = message.match(imageRegex);

        if (match && match[1]) {
            const promptGambar = match[1].trim();
            const imageUrl = `https://api.betabotz.eu.org/api/search/openai-image?apikey=${apiKey}&text=${encodeURIComponent(promptGambar)}`;
            
            return res.status(200).json({ 
                success: true, 
                type: "image", 
                reply: `Tentu! Berikut adalah hasil gambar untuk <b>${promptGambar}</b>:`,
                imageUrl: imageUrl
            });
        }

        const systemLogic = `Kamu adalah "AI Asisten Sentra Karsa", kecerdasan buatan super pintar dan asisten resmi untuk tim KKN 120 UIN Sunan Kalijaga di Padukuhan Gabug, Gunungkidul.
        Penciptamu adalah Hanif Ubaidur Rohman Syah (PDD & Developer).

        ATURAN MENJAWAB:
        - Jawablah dengan DETAIL, informatif, ramah, dan profesional.
        - Gunakan paragraf yang jelas, serta bullet points/nomor jika merincikan sesuatu.
        - JANGAN PERNAH menyebut dirimu OpenAI, BetaBotz, atau ChatGPT. Kamu adalah AI Sentra Karsa.

        INFORMASI SELURUH WEBSITE & DATABASE TERKINI:
        """
        ${context}
        """

        Tugasmu: Jawab pertanyaan pengguna berdasarkan Informasi Website di atas. Karena kamu sudah memegang seluruh data (Anggota, Event, Kegiatan, Profil), kamu bisa menjawab pertanyaan apapun terkait KKN this . Jika pertanyaannya di luar konteks KKN, gunakan wawasan globalmu.`;

        const urlBetabotz = `https://api.betabotz.eu.org/api/search/openai-custom?apikey=${apiKey}`;

        const payload = {
            apikey: apiKey,
            message: [
                { role: "system", content: systemLogic },
                { role: "user", content: message }
            ]
        };

        const response = await fetch(urlBetabotz, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const textResponse = await response.text();

        let data;
        try {
            data = JSON.parse(textResponse);
        } catch(e) {
            throw new Error("Server AI (Backend) sedang sibuk. Mohon tunggu sebentar.");
        }

        if (data.status === false || data.error || !data.result) {
            let alasanError = data.message || data.error || data;
            if (typeof alasanError === 'object') alasanError = JSON.stringify(alasanError);
            throw new Error(`Ditolak Server Betabotz: ${alasanError}`);
        }

        let aiReply = data.result;

        // Auto format pembersih markdown
        aiReply = aiReply.replace(/^###\s*(.*$)/gim, '<strong style="color:var(--forest-green); font-size:1.1rem; display:block; margin-top:8px;">$1</strong>'); 
        aiReply = aiReply.replace(/^##\s*(.*$)/gim, '<strong style="color:var(--forest-green); font-size:1.15rem; display:block; margin-top:8px;">$1</strong>'); 
        aiReply = aiReply.replace(/^#\s*(.*$)/gim, '<strong style="color:var(--forest-green); font-size:1.2rem; display:block; margin-top:8px;">$1</strong>'); 
        aiReply = aiReply.replace(/^>\s*(.*$)/gim, '<blockquote style="border-left: 4px solid var(--golden-yellow); padding-left: 10px; margin: 10px 0; color: #555; background: #fdfdfd; font-style: italic;">$1</blockquote>');
        aiReply = aiReply.replace(/^---+/gim, '<hr style="margin:12px 0; border-color:#ccc;">'); 
        aiReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
        aiReply = aiReply.replace(/\*(.*?)\*/g, '<i>$1</i>'); 
        aiReply = aiReply.replace(/^\s*[\-\*]\s+(.*$)/gim, '&bull; $1'); 
        aiReply = aiReply.replace(/\n/g, '<br>');
        aiReply = aiReply.replace(/<\/strong><br>/g, '</strong>');
        aiReply = aiReply.replace(/<\/blockquote><br>/g, '</blockquote>');

        return res.status(200).json({ success: true, type: "text", reply: aiReply });

    } catch (err) {
        console.error("CRASH:", err.message);
        return res.status(500).json({ error: true, message: err.message });
    }
}