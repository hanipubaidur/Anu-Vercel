export default async function handler(req, res) {
    // Memberikan izin CORS ke website KKN kamu agar tidak diblokir browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method Not Allowed' });

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const message = body?.message || "";

        if (!message) throw new Error("Pesan kosong.");

        const systemLogic = "Kamu adalah asisten virtual cerdas untuk tim KKN 120 Sentra Karsa UIN Sunan Kalijaga yang sedang mengabdi di Padukuhan Gabug, Kalurahan Giricahyo, Gunungkidul. Tugasmu menjawab pertanyaan pengunjung website seputar desa Gabug, proker KKN (digitalisasi wakaf, edukasi karakter, UMKM tiwul). Jawablah dengan ramah, ringkas (maks 3 kalimat). Jangan menyebut dirimu BetaBotz, kamu adalah AI Sentra Karsa.";

        // Server Vercel nembak ke Server Betabotz (AMAN DARI CORS)
        const response = await fetch("https://api.betabotz.eu.org/api/search/openai-custom", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apikey: "CURUTIKUS", 
                message: [
                    { role: "system", content: systemLogic },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        if (!data || !data.result) {
            throw new Error("Gagal mendapat respon dari API.");
        }

        const aiReply = data.result.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        return res.status(200).json({ success: true, reply: aiReply });

    } catch (err) {
        return res.status(500).json({ error: true, message: err.message });
    }
}