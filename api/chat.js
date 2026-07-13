export default async function handler(req, res) {
    // 1. Konfigurasi CORS agar InfinityFree diizinkan masuk
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request dari browser
    if (req.method === 'OPTIONS') return res.status(200).end();
    
    // Blokir jika bukan POST
    if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method Not Allowed' });

    try {
        // 2. Ekstrak pesan (Amankan jika body berupa string)
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const message = body?.message || "";

        if (!message) throw new Error("Pesan dari website kosong.");

        // 3. Tarik API Key dari Environment Vercel
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API_KEY belum disetting di Dashboard Vercel.");

        // 4. Request ke Google Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Jawab singkat, ramah, seputar KKN Sentra Karsa: ${message}` }] }]
            })
        });

        const data = await response.json();

        // 5. Cek apakah HTTP Request ke Google ditolak (misal: API Key salah / High Demand)
        if (!response.ok) {
            console.error("Error API Google:", JSON.stringify(data));
            throw new Error(data.error?.message || "Server AI sedang sibuk, silakan coba lagi.");
        }

        // 6. Cek struktur balasan Google (SANGAT PENTING untuk mencegah error 500)
        // Kadang Google memblokir kata tertentu sehingga 'content' tidak dikirim
        if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts) {
            console.error("Format data aneh dari Google:", JSON.stringify(data));
            throw new Error("Pesan diblokir oleh filter keamanan AI atau terjadi kesalahan sistem.");
        }

        // 7. Ambil teks dan format Markdown tebal
        const aiReply = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        return res.status(200).json({ success: true, reply: aiReply });

    } catch (err) {
        // Error ini akan tercatat di tab "Logs" Vercel
        console.error("DETAIL CRASH BACKEND:", err.message);
        return res.status(500).json({ error: true, message: err.message });
    }
}