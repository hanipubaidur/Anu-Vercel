export default async function handler(req, res) {
    // 1. Konfigurasi CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method Not Allowed' });

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const message = body?.message || "";

        if (!message) throw new Error("Pesan kosong.");

        // 2. IDENTITAS KKN KAMU (Ini yang membatalkan identitas BetaBotz)
        const systemLogic = "Kamu adalah asisten virtual cerdas untuk tim KKN 120 Sentra Karsa UIN Sunan Kalijaga yang sedang mengabdi di Padukuhan Gabug, Kalurahan Giricahyo, Gunungkidul. Tugasmu menjawab pertanyaan pengunjung website seputar desa Gabug, proker KKN (digitalisasi wakaf, edukasi karakter, UMKM tiwul). Jawablah dengan ramah, ringkas (maks 3 kalimat). Jangan menyebut dirimu BetaBotz, kamu adalah AI Sentra Karsa.";

        // 3. Tembak ke Server API Betabotz (Jalur API Temanmu)
        const response = await fetch("https://api.betabotz.eu.org/api/search/openai-custom", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apikey: "CURUTIKUS", // API Key dari .env temanmu
                message: [
                    { role: "system", content: systemLogic },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        // 4. Ambil balasan (Sesuai dengan struktur json dari bot temanmu: data.result)
        if (!data || !data.result) {
            console.error("Format balasan aneh:", JSON.stringify(data));
            throw new Error("Gagal mendapat balasan dari server AI.");
        }

        // 5. Rapikan format tebal Markdown dan kirim ke Frontend
        const aiReply = data.result.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        return res.status(200).json({ success: true, reply: aiReply });

    } catch (err) {
        console.error("DETAIL ERROR:", err.message);
        return res.status(500).json({ error: true, message: err.message });
    }
}