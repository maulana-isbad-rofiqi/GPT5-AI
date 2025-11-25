const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Fungsi untuk menambahkan pesan ke layar
function addMessage(content, sender, isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    if (isHtml) {
        bubble.innerHTML = content;
    } else {
        bubble.textContent = content;
    }
    
    messageDiv.appendChild(bubble);
    chatContainer.appendChild(messageDiv);
    
    // Auto scroll ke bawah
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Handle Submit
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Tampilkan pesan user
    addMessage(text, 'user');
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    // 2. Indikator loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai';
    loadingDiv.innerHTML = `<div class="typing-indicator">Sedang mengetik...</div>`;
    chatContainer.appendChild(loadingDiv);

    try {
        // 3. Request ke API (Sama seperti script bot WA)
        // Menggunakan API internal Vercel kita sendiri
        const apiUrl = `/api/chat?message=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Hapus loading
        chatContainer.removeChild(loadingDiv);

        if (!data.status || !data.result) {
            throw new Error('API Error');
        }

        const answer = data.result.text || 'Maaf, saya tidak bisa menjawab.';
        const citations = data.result.citations || [];

        // 4. Format jawaban dengan Marked.js (Markdown -> HTML)
        let formattedAnswer = marked.parse(answer);

        // Jika ada referensi, tambahkan di bawah
        if (citations.length > 0) {
            formattedAnswer += `<div class="citations"><strong>Referensi:</strong><br>`;
            citations.slice(0, 5).forEach(cite => {
                formattedAnswer += `<a href="${cite.url}" target="_blank">🔗 ${cite.title}</a>`;
            });
            formattedAnswer += `</div>`;
        }

        addMessage(formattedAnswer, 'ai', true);

    } catch (error) {
        if(chatContainer.contains(loadingDiv)) chatContainer.removeChild(loadingDiv);
        addMessage('⚠️ Terjadi kesalahan koneksi atau server.', 'ai');
        console.error(error);
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
});
