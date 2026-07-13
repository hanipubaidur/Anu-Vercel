export default async function handler(req, res) {
    // Setting header agar website KKN kamu diizinkan akses
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: true, message: 'Method Not Allowed' });
    }

    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: true, message: 'Pesan tidak boleh kosong' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: true, message: 'API Key belum disetting di Vercel' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const systemContext = "Kamu adalah asisten virtual cerdas untuk tim KKN 120 Sentra Karsa UIN Sunan Kalijaga yang sedang mengabdi di Padukuhan Gabug, Kalurahan Giricahyo, Gunungkidul. Tugasmu menjawab pertanyaan pengunjung website seputar desa Gabug, proker KKN (digitalisasi wakaf, edukasi karakter, UMKM tiwul). Jawablah dengan ramah, ringkas (maks 3 kalimat). Jangan menjawab hal di luar konteks KKN.";
        const promptText = `${systemContext}\n\nPertanyaan User: ${message}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            throw new Error('Server AI sedang sibuk (High Demand). Silakan coba lagi sebentar lagi.');
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiReply = data.candidates[0].content.parts[0].text;
            
            // Format tulisan tebal (bold) dari Markdown ke tag HTML <b>
            aiReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            
            return res.status(200).json({ success: true, reply: aiReply });
        } else {
            throw new Error('Format balasan AI tidak dikenali.');
        }

    } catch (error) {
        return res.status(500).json({ error: true, message: error.message });
    }
}