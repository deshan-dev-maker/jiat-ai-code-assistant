const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const keyStatus = document.getElementById("keyStatus");
const languageSelect = document.getElementById("languageSelect");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const copyFixedBtn = document.getElementById("copyFixedBtn");
const resultCards = document.getElementById("resultCards");
const correctedCode = document.getElementById("correctedCode");
const themeToggle = document.getElementById("themeToggle");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_ID = "stepfun/step-3.5-flash:free";
const STORAGE_KEY = "jiat_openrouter_api_key";
const THEME_KEY = "jiat_theme";

let lastFixedCode = "";

const editor = CodeMirror.fromTextArea(document.getElementById("codeInput"), {
  mode: "javascript",
  theme: "material-darker",
  lineNumbers: true,
  lineWrapping: true,
  indentUnit: 2,
  tabSize: 2
});

window.addEventListener("DOMContentLoaded", () => {
  loadSavedApiKey();
  loadSavedTheme();
});

function loadSavedApiKey() {
  const savedKey = localStorage.getItem(STORAGE_KEY);

  if (savedKey) {
    apiKeyInput.value = savedKey;
    keyStatus.textContent = "API key is saved in localStorage.";
    keyStatus.className = "text-sm mt-3 text-emerald-500";
  } else {
    keyStatus.textContent = "No API key saved yet.";
    keyStatus.className = "text-sm mt-3 muted-text";
  }
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀️ Light";
    editor.setOption("theme", "default");
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "🌙 Dark";
    editor.setOption("theme", "material-darker");
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");

  if (document.body.classList.contains("light")) {
    localStorage.setItem(THEME_KEY, "light");
    themeToggle.textContent = "☀️ Light";
    editor.setOption("theme", "default");
  } else {
    localStorage.setItem(THEME_KEY, "dark");
    themeToggle.textContent = "🌙 Dark";
    editor.setOption("theme", "material-darker");
  }

  editor.refresh();
});

languageSelect.addEventListener("change", () => {
  editor.setOption("mode", getCodeMirrorMode(languageSelect.value));
});

saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();

  if (!key) {
    keyStatus.textContent = "Please enter a valid API key.";
    keyStatus.className = "text-sm mt-3 text-red-500";
    return;
  }

  localStorage.setItem(STORAGE_KEY, key);
  keyStatus.textContent = "API key saved successfully.";
  keyStatus.className = "text-sm mt-3 text-emerald-500";
});

clearBtn.addEventListener("click", () => {
  editor.setValue("");
  resultCards.innerHTML = `<div class="muted-text">Analysis results will appear here.</div>`;
  correctedCode.textContent = "No corrected code yet.";
  lastFixedCode = "";
});

copyFixedBtn.addEventListener("click", async () => {
  if (!lastFixedCode) {
    alert("No corrected code to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(lastFixedCode);
    alert("Corrected code copied.");
  } catch (error) {
    alert("Could not copy corrected code.");
  }
});

analyzeBtn.addEventListener("click", async () => {
  const apiKey = localStorage.getItem(STORAGE_KEY);
  const code = editor.getValue().trim();
  const language = languageSelect.value;

  if (!apiKey) {
    showErrorMessage("Please save your OpenRouter API key first.");
    return;
  }

  if (!code) {
    showErrorMessage("Please enter some code to analyze.");
    return;
  }

  resultCards.innerHTML = `<div class="muted-text">Analyzing your code...</div>`;
  correctedCode.textContent = "Waiting for corrected code...";
  lastFixedCode = "";

  const prompt = `
You are an expert programming assistant and code debugger.

Analyze the following code.

Language: ${language}

Return ONLY valid JSON.
Do not include markdown.
Do not include backticks.
Do not include extra text before or after the JSON.

Use this exact JSON structure:
{
  "hasError": true,
  "summary": "short summary",
  "errors": [
    {
      "error": "what the error is",
      "line": "line number or approximate line",
      "location": "where the error is",
      "why": "why it happens",
      "fix": "how to fix it"
    }
  ],
  "output": "expected output of the code",
  "correctedCode": "full corrected code here",
  "improvements": [
    "improvement 1",
    "improvement 2"
  ]
}

Rules:
- If the code has errors:
  - set "hasError" to true
  - explain the errors clearly
  - "output" can be empty if the code cannot run
- If the code is correct:
  - set "hasError" to false
  - "errors" must be an empty array
  - "summary" must clearly say the code appears correct
  - "output" must contain the expected printed / returned result
- Always return "correctedCode"
- "correctedCode" must be the full code
- Simulate the code execution logically to determine the answer/output
- Be precise about missing characters, broken syntax, wrong variable names, missing brackets, missing semicolons if relevant, tag issues, and invalid structure
- For line numbers, provide the best estimate if exact line number is uncertain

User code:
${code}
`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin || "http://localhost",
        "X-OpenRouter-Title": "JIAT AI Code Assistant"
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          {
            role: "system",
            content: "You are a precise debugging assistant. Return JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showErrorMessage(data?.error?.message || "API request failed.");
      return;
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      showErrorMessage("No response content returned.");
      return;
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (jsonError) {
      showErrorMessage("The AI returned an invalid JSON response.");
      correctedCode.textContent = content;
      return;
    }

    renderResults(parsed);
  } catch (error) {
    showErrorMessage("Network or JavaScript error while analyzing.");
  }
});

function renderResults(data) {
  const {
    hasError = false,
    summary = "No summary provided.",
    errors = [],
    output = "",
    correctedCode: fixedCode = "",
    improvements = []
  } = data;

  let html = `
    <div class="result-card">
      <div class="result-label">Summary</div>
      <div class="result-value">${escapeHtml(summary)}</div>
    </div>
  `;

  if (hasError && errors.length > 0) {
    errors.forEach((item, index) => {
      html += `
        <div class="result-card">
          <div class="result-label">Error ${index + 1}</div>
          <div class="result-value"><strong>Error:</strong> ${escapeHtml(item.error || "N/A")}</div>
          <div class="result-value mt-2"><strong>Line:</strong> ${escapeHtml(item.line || "N/A")}</div>
          <div class="result-value mt-2"><strong>Location:</strong> ${escapeHtml(item.location || "N/A")}</div>
          <div class="result-value mt-2"><strong>Why:</strong> ${escapeHtml(item.why || "N/A")}</div>
          <div class="result-value mt-2"><strong>Fix:</strong> ${escapeHtml(item.fix || "N/A")}</div>
        </div>
      `;
    });
  } else {
    html += `
      <div class="result-card">
        <div class="result-label">Answer</div>
        <div class="result-value">${escapeHtml(output || "No visible output.")}</div>
      </div>
    `;
  }

  if (improvements.length > 0) {
    html += `
      <div class="result-card">
        <div class="result-label">Improvements</div>
        <div class="result-value">${escapeHtml("• " + improvements.join("\n• "))}</div>
      </div>
    `;
  }

  resultCards.innerHTML = html;
  correctedCode.textContent = fixedCode || "No corrected code returned.";
  lastFixedCode = fixedCode || "";
}

function showErrorMessage(message) {
  resultCards.innerHTML = `
    <div class="result-card">
      <div class="result-label">Error</div>
      <div class="result-value">${escapeHtml(message)}</div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCodeMirrorMode(language) {
  switch (language) {
    case "HTML":
      return "xml";
    case "CSS":
      return "css";
    case "JavaScript":
      return "javascript";
    case "Python":
      return "python";
    case "Java":
      return "text/x-java";
    case "C":
      return "text/x-csrc";
    case "C++":
      return "text/x-c++src";
    case "C#":
      return "text/x-csharp";
    case "PHP":
      return "application/x-httpd-php";
    case "Ruby":
      return "ruby";
    case "Go":
      return "go";
    case "Rust":
      return "rust";
    default:
      return "javascript";
  }
}