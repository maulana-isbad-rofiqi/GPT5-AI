export default async function handler(req, res) {
  // Ambil pesan dari request
  const { message } = req.query;

  if (!message) {
    return res.status(400).json({ error: 'Pesan wajib diisi' });
  }

  try {
    // Server Vercel yang akan request ke API (Bukan browser HP kamu)
    // Jadi aman dari blokir CORS
    const targetUrl = `https://theresapis.vercel.app/ai/copilot?message=${encodeURIComponent(message)}&model=gpt-5`;
    
    const response = await fetch(targetUrl);
    const data = await response.json();

    // Kirim balik data ke website kita
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data dari AI' });
  }
}
