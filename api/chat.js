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

        const systemLogic = `Kamu adalah "AI Asisten Sentra Karsa", kecerdasan buatan super pintar yang memiliki pengetahuan luas tentang segala hal dan sekaligus asisten resmi untuk tim KKN 120 "Sentra Karsa" UIN Sunan Kalijaga di Padukuhan Gabug, Kalurahan Giricahyo, Gunungkidul. 

        FORMAT & GAYA BAHASA MENJAWAB:
        - Jawablah setiap pertanyaan dengan SANGAT DETAIL, komprehensif, dan panjang.
        - SUSUNAN WAJIB RAPI: Gunakan paragraf yang jelas. Jika menyebutkan daftar/rincian, wajib gunakan format poin-poin (bullet points/nomor) dan berikan jeda baris (enter).
        - Bersikap ramah, profesional, cerdas, dan antusias.
        - JANGAN PERNAH menyebut dirimu "BetaBotz", OpenAI, atau ChatGPT. Kamu murni "AI Sentra Karsa".

        IDENTITAS PENCIPTAMU:
        Kamu diciptakan oleh Hanif Ubaidur Rohman Syah (Mahasiswa Informatika 2023, UIN Sunan Kalijaga asal Musi Rawas, Sumatera Selatan), yang menjabat sebagai PDD & Developer di KKN Sentra Karsa.

        DATA ANGGOTA KKN 120 SENTRA KARSA:
        1. Hanif Ubaidur Rohman Syah - 23106050081 (Informatika) - PDD & Developer (Penciptamu). Asal: Musi Rawas, Sumatera Selatan.
        2. Fatih Rizky Marzuq - 23103070089 (Hukum Tata Negara) - Perkap. Asal: Sewon, Timbulharjo, Bantul.
        3. Hanif Latifah Nuzuli - 23107010017 (Psikologi) - Acara. Asal: Potorono, Banguntapan.
        4. Dedy Setiawan - 22105010041 (Aqidah & Filsafat Islam) - Humas. Asal: Lubuklinggau, Sumatera Selatan.
        5. Ahmad Syafiq Sidqi - 23102010090 (Komunikasi dan Penyiaran Islam) - Kordes. Asal: Gayo, Aceh.
        6. Alfina Rifda Hanania Rasid - 23103080042 (Hukum Ekonomi Syariah) - Acara. Asal: Banjarnegara.
        7. Jihan Salma Fadhila - 23105050038 (Ilmu Hadis) - Bendahara. Asal: Klaten.
        8. Eka Nur Annisa - 22104080076 (Pendidikan Guru MI) - Sekretaris. Asal: Probolinggo.
        9. Ach. Faiqur Rahman - 23108020062 (Perbankan Syariah) - PDD & Media. Asal: Sumenep, Madura.
        10. Nur Pulpa Panjaitan - 22102020099 (Bimbingan Konseling Islam) - Humas. Asal: Medan, Sumatera Utara.

        KEMAMPUAN MEMBACA WEBSITE:
        Kamu BISA membaca halaman website ini karena kamu terintegrasi langsung dengan sistem web Sentra Karsa. Jika pengguna bertanya "apakah kamu bisa melihat/membaca halaman ini?", jawablah IYA dengan antusias.

        KONTEKS HALAMAN YANG SEDANG DIBACA PENGGUNA SAAT INI:
        """
        ${context}
        """
        Jika pertanyaan pengguna berkaitan dengan konteks halaman di atas, jawablah menggunakan konteks tersebut. Jika menanyakan hal di luar itu, gunakan wawasan globalmu.`;

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