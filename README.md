🤖 JIAT AI Code Assistant

An AI-powered code assistant that analyzes your code, detects errors, suggests fixes, and shows expected output — all in one place.

---

🚀 Features

- 🔍 Detect syntax and logical errors
- 📍 Show error location and line number
- 🛠 Provide clear fix suggestions
- ✅ Display output if code is correct
- 💡 Suggest improvements
- 🌗 Dark / Light theme toggle
- 🧾 Code editor with line numbers (CodeMirror)
- 🎨 Modern UI using TailwindCSS
- 🧠 AI-powered analysis using OpenRouter API

---

🧪 How It Works

1. Write or paste your code into the editor  
2. Select the programming language  
3. Click **Analyze**  
4. Get:
   - Errors (if any)
   - Fix suggestions
   - Output (if correct)
   - Improved code version

---

🛠 Technologies Used

- HTML
- CSS (TailwindCSS + Custom Theme System)
- JavaScript
- CodeMirror (Code Editor with line numbers)
- OpenRouter API

---

🤖 AI Model

stepfun/step-3.5-flash:free

---

⚙️ Setup Instructions

1. Clone or download this repository

git clone https://github.com/deshan-dev-maker/jiat-ai-code-assistant.git

2. Open the project folder

3. Run the project:

open index.html

4. Enter your OpenRouter API key

5. Start analyzing code 🚀

---

🔐 API Key Note

- Your API key is stored in browser localStorage
- This is safe for personal use
- Do NOT use this method in production apps
- For production, use a backend to secure the API key

---

🌗 Theme Support

- Dark mode (default)
- Light mode toggle
- Theme preference is saved automatically

---

📁 Project Structure

project/
│
├── index.html
├── styles.css
├── app.js
└── README.md

---

💡 Example

Input:
console.log(10 + 5);

Output:
15

---

👨‍💻 Author

Deshan Dev

---

⭐ Support

If you like this project:
- Star the repository  
- Fork it  
- Improve it  

---

🚀 Future Improvements

- Real code execution (sandbox environment)
- Monaco Editor integration
- Error line highlighting
- Multi-file support
- Backend API integration for security
- Live preview panel
