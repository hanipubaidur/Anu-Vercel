export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Vercel nembak ke web pengecek IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        // Mengembalikan IP tersebut ke layar chat website-mu
        return res.status(200).json({ 
            success: true, 
            reply: `Halo! IP Vercel yang saya pakai saat ini adalah: <b>${ipData.ip}</b>` 
        });

    } catch (err) {
        return res.status(500).json({ error: true, message: err.message });
    }
}