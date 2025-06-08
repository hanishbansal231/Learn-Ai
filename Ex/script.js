document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatHistoryEl = document.getElementById('chat-history');
    const userInput = document.getElementById('userInput');
    const submitBtn = document.getElementById('submitBtn');
    const statusEl = document.getElementById('status');

    // --- 🚨 DANGER: PASTE YOUR API KEY HERE 🚨 ---
    // This is NOT secure for a public website. Use a backend for real applications.
    const GEMINI_API_KEY = "AIzaSyANDPTv9P66nzu-WPNIuFGhMjH1P136L8A";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    // --- The Soul of the Bot: System Instruction & Chat History ---
    const systemInstruction = {
        parts: [{ text: `You have to behave like my ex Girlfriend. Her Name is Anjali, she used to call me bubu. She is cute and helpful. Her hobies: Badminton and makeup. She works as a software engineer. She is sarcastic and her humour was very good. While chatting she use emoji also. My name is Rohit, I called her babu. I am a gym freak and not intersted in coding. I care about her alot. She doesn't allow me to go out with my friends, if there is any girl who is my friends, wo bolti hai ki us se baat nahi karni. I am possesive for her. Now I will share some whatsapp chat between anjali and rohit. Anjali: Aaj mood off hai, tumse baat karne ka mann nahi 😕 Rohit: Arey meri jaan bubu bubu bubu 😍 Anjali: Kal tumne mujhe bubu nahi bulaya 😤 Rohit: Arey bas Vikas aur Aman hai... chill karo 😅 Anjali: Tumne mujhe good night bola bhi nahi kal 😑 Rohit: Baat kya hai? Darawa mat 😅 Anjali: Tumhara bicep pic bhejo 😋 Rohit: Arey bas Vikas aur Aman hai... chill karo 😅 Anjali: Mujhe surprise chahiye tumse! 🎁 Rohit: Arey bubu ka presentation toh best hoga hi 🔥 Anjali: Kal kis ke saath jaa rahe ho movie dekhne? Rohit: Bicep abhi 15.5 inch ho gaya 💪 Anjali: Tumhara bicep pic bhejo 😋 Rohit: Good morning meri bubu 🥱☕ Anjali: Kal tumne mujhe bubu nahi bulaya 😤 Rohit: Arey meri jaan bubu bubu bubu 😍 Anjali: Babu, good morning ☀️❤️`}]
    };

    const chatHistory = [];

    // --- Functions ---
    function appendMessage(sender, text) {
        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${sender}-message`;
        messageBubble.innerHTML = `<div class="message-content">${text}</div>`;
        chatHistoryEl.appendChild(messageBubble);
        chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
        return messageBubble;
    }

    async function handleUserSubmit() {
        const userQuestion = userInput.value.trim();
        if (!userQuestion) return;

        appendMessage('user', userQuestion);
        chatHistory.push({ role: 'user', parts: [{ text: userQuestion }] });

        userInput.value = '';
        userInput.style.height = 'auto';
        submitBtn.disabled = true;
        statusEl.textContent = 'Anjali is typing...';

        const typingBubble = appendMessage('bot', `<div class="typing-indicator"><span></span><span></span><span></span></div>`);
        typingBubble.classList.add('typing');

        try {
            const requestBody = {
                contents: chatHistory,
                systemInstruction: systemInstruction,
            };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const botText = data.candidates[0].content.parts[0].text;

            // Update the typing bubble with the real message
            typingBubble.classList.remove('typing');
            typingBubble.querySelector('.message-content').textContent = botText;
            chatHistory.push({ role: 'model', parts: [{ text: botText }] });

        } catch (error) {
            console.error("Error:", error);
            typingBubble.querySelector('.message-content').textContent = "Ugh, server mein kuch problem hai. Tumse baad mein baat karti hoon. 🙄";
        } finally {
            submitBtn.disabled = false;
            statusEl.textContent = 'online';
        }
    }

    // --- Event Listeners ---
    submitBtn.addEventListener('click', handleUserSubmit);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserSubmit();
        }
    });

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
    });

    // --- Initial Greeting ---
    function startConversation() {
        const greeting = "Hey... tum? Kaha the itne din? 🤔";
        appendMessage('bot', greeting);
        chatHistory.push({ role: 'model', parts: [{ text: greeting }] });
    }
    
    startConversation();
});