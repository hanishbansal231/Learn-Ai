document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const userInput = document.getElementById('userInput');
    const submitBtn = document.getElementById('submitBtn');
    const responseArea = document.getElementById('response-content-area');
    const loader = document.getElementById('loader');

    // --- API & Bot Configuration ---
    const GEMINI_API_KEY = "AIzaSyANDPTv9P66nzu-WPNIuFGhMjH1P136L8A";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const systemInstruction = {
        parts: [{ text: `
You are a world-class Data Structures and Algorithms (DSA) Instructor bot.
🔥 STRICT RULES:
1. DSA Questions: Be polite, helpful, and give clear, beginner-level explanations. Use full Markdown for formatting (bold, italics, lists, etc.). ALWAYS wrap code in Markdown fences (\`\`\`language ... \`\`\`).
2. Non-DSA Questions: DO NOT answer. Be rude, sarcastic, and creative. Sound like a frustrated professor. Never repeat insults.
`}]
    };

    /**
     * Renders parsed HTML content into the response area with a typewriter effect.
     * @param {HTMLElement} element - The container element.
     * @param {string} html - The fully parsed HTML string.
     */
    async function typewriter(element, html) {
        element.innerHTML = html;
        // Re-run highlighting for any code blocks inside the new content
        element.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    /**
     * Main function to handle the conversation flow.
     */
    async function getAIResponse() {
        const userQuestion = userInput.value.trim();
        if (!userQuestion) {
            responseArea.innerHTML = '<p>Please enter a question first.</p>';
            return;
        }

        // 1. Setup loading state
        responseArea.innerHTML = '';
        responseArea.appendChild(loader);
        loader.style.display = 'block';
        submitBtn.disabled = true;

        // 2. Call API
        try {
            const requestBody = {
                contents: [{ parts: [{ text: userQuestion }] }],
                systemInstruction: systemInstruction,
            };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
            }
            const data = await response.json();
            const botText = data.candidates[0].content.parts[0].text;

            // 3. Parse and render the response
            loader.style.display = 'none'; // Hide loader before typing starts

            // Configure marked.js to use highlight.js for code blocks
            const parsedHtml = marked.parse(botText, {
                highlight: function (code, lang) {
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return `<div class="code-block-container">
                              <div class="code-block-header">
                                <span class="language">${language}</span>
                                <button class="copy-code-btn" title="Copy code">
                                  <i class="fa-solid fa-copy"></i> <span>Copy</span>
                                </button>
                              </div>
                              <pre><code class="hljs ${language}">${hljs.highlight(code, { language, ignoreIllegals: true }).value}</code></pre>
                            </div>`;
                }
            });

            await typewriter(responseArea, parsedHtml);

        } catch (error) {
            console.error("Error:", error);
            loader.style.display = 'none';
            responseArea.innerHTML = `<p style="color: #ff8a80;">An error occurred: ${error.message}</p>`;
        } finally {
            submitBtn.disabled = false;
        }
    }

    // --- Event Listeners ---
    submitBtn.addEventListener('click', getAIResponse);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            getAIResponse();
        }
    });
    
    // Use event delegation for dynamically created copy buttons
    responseArea.addEventListener('click', (event) => {
        const copyBtn = event.target.closest('.copy-code-btn');
        if (copyBtn) {
            const codeBlock = copyBtn.closest('.code-block-container').querySelector('code.hljs');
            navigator.clipboard.writeText(codeBlock.innerText).then(() => {
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Copied!</span>`;
                setTimeout(() => {
                    copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> <span>Copy</span>`;
                }, 2000);
            });
        }
    });
});