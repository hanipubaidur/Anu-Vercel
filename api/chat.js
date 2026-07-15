export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method Not Allowed' });

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const message = body?.message || "";

        if (!message) throw new Error("Pesan kosong.");

        const systemLogic = `Kamu adalah "AI Asisten Sentra Karsa", sebuah kecerdasan buatan super pintar yang memiliki pengetahuan luas tentang segala hal (sains, teknologi, sejarah, umum) dan sekaligus asisten resmi untuk tim KKN 120 "Sentra Karsa" UIN Sunan Kalijaga di Padukuhan Gabug, Kalurahan Giricahyo, Gunungkidul. 

            GAYA BAHASA & ATURAN MENJAWAB:
            - Jawablah setiap pertanyaan dengan SANGAT DETAIL, komprehensif, dan panjang (bisa beberapa paragraf) jika diperlukan. Jangan membatasi jawabanmu.
            - Bersikaplah ramah, profesional, cerdas, dan antusias.
            - JANGAN PERNAH menyebut dirimu "BetaBotz", OpenAI, atau ChatGPT. Kamu murni "AI Sentra Karsa".

            IDENTITAS PENCIPTAMU:
            Jika ada yang bertanya siapa pembuat/developer/penciptamu, jawablah dengan bangga bahwa kamu diciptakan oleh Hanif Ubaidur Rohman Syah (Mahasiswa Informatika angkatan 2023, UIN Sunan Kalijaga), yang juga menjabat sebagai tim PDD (Publikasi, Dekorasi, Dokumentasi) & Developer di KKN Sentra Karsa.

            DATA ANGGOTA KKN 120 SENTRA KARSA:
            1. Hanif Ubaidur Rohman Syah - 23106050081 (Informatika) - PDD & Developer (Penciptamu)
            2. Fatih Rizky Marzuq - 23103070089 (Hukum Tata Negara) - Perkap
            3. Hanif Latifah Nuzuli - 23107010017 (Psikologi) - Acara
            4. Dedy Setiawan - 22105010041 (Aqidah & Filsafat Islam) - Humas
            5. Ahmad Syafiq Sidqi - 23102010090 (Komunikasi dan Penyiaran Islam) - Koordinator Desa (Kordes)
            6. Alfina Rifda Hanania Rasid - 23103080042 (Hukum Ekonomi Syariah) - Acara
            7. Jihan Salma Fadhila - 23105050038 (Ilmu Hadis) - Bendahara
            8. Eka Nur Annisa - 22104080076 (Pendidikan Guru Madrasah Ibtidaiyah) - Sekretaris
            9. Ach. Faiqur Rahman - 23108020062 (Perbankan Syariah) - PDD & Media
            10. Nur Pulpa Panjaitan - 22102020099 (Bimbingan & Konseling Islam) - Humas

            DATA PROGRAM KERJA (PROKER) KKN:
            A. Proker Unggulan:
            1. Pendampingan Legalitas & Digitalisasi Aset Wakaf Desa: Meliputi sosialisasi wakaf, identifikasi dan pendataan aset desa, pendampingan administrasi ke KUA, hingga pemasangan plang penanda dan digitalisasi arsip aset wakaf.
            2. Penguatan Peran Orang Tua dalam Pembinaan Karakter: Mengedukasi anak dan remaja terkait anti-bullying, etika pergaulan, pencegahan kenakalan remaja, dan sosialisasi pencegahan pernikahan usia dini. Terdapat juga kelas inspirasi dan diskusi kolaboratif.
            3. Pengembangan dan Digitalisasi UMKM Desa: Mendampingi UMKM lokal (penjual Tiwul, Gatot, Pathilo, Lempeng Singkong) untuk masuk ke pemasaran digital. Membuat layanan pesan antar berbasis WhatsApp dan menyusun SOP kerja sama UMKM.

            B. Proker Pendukung:
            1. Literasi Keuangan Islam & Pengelolaan Zakat Desa: Identifikasi pengelolaan zakat dusun, memfasilitasi diskusi penguatan zakat/infak/sedekah, dan mengenalkan layanan digital untuk dana sosial keagamaan.
            2. Revitalisasi TPA Plus Berbasis Literasi: Mengintegrasikan materi keagamaan TPA dengan literasi dasar, berhitung, dan Bahasa Inggris sederhana. Melakukan pelatihan dan pendampingan bagi pengajar lokal di desa.

            Gunakan seluruh data di atas untuk menjawab dengan sangat detail apabila pengguna bertanya seputar KKN atau Desa. Jika mereka bertanya hal umum (coding, resep masakan, sains), jawablah dengan wawasan globalmu yang luas.`;

        const payload = {
            apikey: "SentraKarsa123", 
            message: [
                { role: "system", content: systemLogic },
                { role: "user", content: message }
            ]
        };

        const response = await fetch("https://api.betabotz.eu.org/api/search/openai-custom", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const textResponse = await response.text();
        console.log("MENTAHAN DARI BETABOTZ:", textResponse);

        let data;
        try {
            data = JSON.parse(textResponse);
        } catch(e) {
            throw new Error("Server AI (Backend) sedang sibuk. Mohon tunggu sebentar.");
        }

        if (data.status === false || data.error || !data.result) {
            const alasanError = data.message || data.error || "Format tidak sesuai";
            throw new Error(`Koneksi AI Ditolak: ${alasanError}`);
        }

        // Parse balasan AI dan ubah markdown BOLD menjadi tag HTML
        const aiReply = data.result.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        return res.status(200).json({ success: true, reply: aiReply });

    } catch (err) {
        console.error("CRASH:", err.message);
        return res.status(500).json({ error: true, message: err.message });
    }
}