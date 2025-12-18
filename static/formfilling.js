// formfilling.js - Updated with Bot Icons, Clean Bubbles, and Review/Correction Flow
const pdfInput = document.getElementById("pdfInput");
const uploadButton = document.getElementById("uploadButton");
const sampleButton = document.getElementById("sampleButton");
const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micButton = document.getElementById("micButton");
const startFormBtn = document.getElementById("startFormBtn");
const submitFormBtn = document.getElementById("submitFormBtn");
const downloadBox = document.getElementById("downloadBox");
const docxLink = document.getElementById("docxLink");
const pdfLink = document.getElementById("pdfLink");

let currentSessionId = null;
let fieldsFromPdf = [];
let sessionFields = [];
let sessionIndex = 0;
let responses = {};
let isListening = false;
let isSubmitting = false;
let recognition = null;

// Review state machine
let reviewMode = false;          // true when all fields are filled
let reviewState = null;          // 'await_confirm' | 'await_field_name' | 'await_new_value'
let pendingFieldToEdit = null;

// ICONS
const BOT_ICON = "/static/bot_icon.jpg";
const USER_ICON = "/static/user_icon.jpg";

// Speech recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        appendMessage('User', transcript, 'user');
        handleUserText(transcript);
    };

    recognition.onerror = (event) => {
        appendMessage('System', 'Speech recognition error: ' + event.error, 'system');
        isListening = false;
        micButton.textContent = 'Speak';
    };

    recognition.onend = () => {
        isListening = false;
        micButton.textContent = 'Speak';
    };
} else {
    appendMessage('System', 'Speech recognition not supported. Use typing instead.', 'system');
    micButton.disabled = true;
}

// Browser TTS
function speak(text) {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
}

// Upload
uploadButton.addEventListener('click', () => pdfInput.click());

pdfInput.addEventListener('change', async () => {
    const file = pdfInput.files[0];
    if (!file) return;

    appendMessage('System', `Uploading "${file.name}"...`, 'system');
    const formData = new FormData();
    formData.append('pdf', file);

    try {
        const resp = await fetch('/upload_pdf', { method: 'POST', body: formData });
        const data = await resp.json();

        if (data.success) {
            appendMessage('System', 'PDF uploaded and processed.', 'system');

            if (data.cleaned_text) appendMessage('System', escapeHtml(data.cleaned_text), 'pre');
            if (data.modified_text) appendMessage('System', escapeHtml(data.modified_text), 'pre');

            fieldsFromPdf = data.fields || [];
            if (fieldsFromPdf.length === 0) appendMessage('System', 'No fields detected. Use Start Form button.', 'system');
            else appendMessage('System', fieldsFromPdf.join('<br/>'), 'system');

        } else appendMessage('System', `Upload failed: ${data.error}`, 'system');

    } catch (err) {
        console.error(err);
        appendMessage('System', 'Upload failed (network/error).', 'system');
    }
});

// Use Sample PDF
sampleButton.addEventListener('click', async () => {
    appendMessage('System', 'Using sample PDF...', 'system');

    try {
        const resp = await fetch('/use_sample', { method: 'POST' });
        const data = await resp.json();

        if (data.success) {
            appendMessage('System', 'Sample PDF processed.', 'system');

            fieldsFromPdf = data.fields || [];
            if (fieldsFromPdf.length === 0) appendMessage('System', 'No fields detected in sample. Use Start Form button.', 'system');
            else appendMessage('System', fieldsFromPdf.join('\n'), 'system');

        } else {
            appendMessage('System', 'Sample processing failed: ' + data.error, 'system');
        }
    } catch (err) {
        console.error(err);
        appendMessage('System', 'Network error processing sample PDF.', 'system');
    }
});

// Start Form
startFormBtn.addEventListener('click', async () => {
    let chosenFields = fieldsFromPdf.slice();
    if (chosenFields.length === 0) {
        const manual = prompt('Enter fields separated by commas:');
        if (!manual) return;
        chosenFields = manual.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
        const resp = await fetch('/start_session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: chosenFields })
        });
        const data = await resp.json();

        if (data.success) {
            currentSessionId = data.session_id;
            sessionFields = data.fields;
            sessionIndex = 0;
            responses = {};
            reviewMode = false;
            reviewState = null;
            pendingFieldToEdit = null;
            submitFormBtn.style.display = 'none';
            downloadBox.style.display = 'none';
            appendMessage('System', 'Form session started.', 'system');
            askNextField();
        } else appendMessage('System', 'Could not start session: ' + data.error, 'system');

    } catch (err) {
        console.error(err);
        appendMessage('System', 'Failed to start session (network).', 'system');
    }
});

// Submit Form (visible only after confirmation)
submitFormBtn.addEventListener('click', async () => {
    if (!currentSessionId || isSubmitting) return;

    isSubmitting = true;
    submitFormBtn.textContent = 'Processing...';
    submitFormBtn.disabled = true;

    try {
        const resp = await fetch('/finalize_form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: currentSessionId })
        });
        const data = await resp.json();

        if (data.success) {
            appendMessage('System', 'Form finalized. Download below.', 'system');
            docxLink.href = data.docx_url;
            pdfLink.href = data.pdf_url;

            if (!data.pdf_url || data.pdf_url.endsWith('/download/')) {
                pdfLink.style.display = 'none';
                appendMessage('System', 'PDF unavailable due to conversion limitations.', 'system');
            } else pdfLink.style.display = 'inline-block';

            downloadBox.style.display = 'block';
            submitFormBtn.style.display = 'none';
        } else {
            appendMessage('System', 'Error finalizing form: ' + data.error, 'system');
            submitFormBtn.textContent = 'Submit Form';
            submitFormBtn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        appendMessage('System', 'Network error finalizing form.', 'system');
        submitFormBtn.textContent = 'Submit Form';
        submitFormBtn.disabled = false;
    } finally {
        isSubmitting = false;
    }
});

// Send typed input
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage('User', text, 'user');
    userInput.value = '';
    handleUserText(text);
});

// ENTER key
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendBtn.click();
    }
});

// Mic
micButton.addEventListener('click', () => {
    if (!recognition) return;

    if (!isListening) {
        try {
            recognition.start();
            isListening = true;
            micButton.textContent = 'Listening...';
        } catch {
            appendMessage('System', 'Error starting recognition.', 'system');
        }
    } else recognition.stop();
});

// ---- Flow helpers ----
function askNextField() {
    if (!sessionFields || sessionIndex >= sessionFields.length) {
        // switch to review mode
        reviewMode = true;
        reviewState = 'await_confirm';
        appendMessage('System', 'All fields filled. Review below.', 'system');
        refreshAndRenderReview();
        return;
    }
    askNextFieldUI(sessionFields[sessionIndex]);
}

function askNextFieldUI(fieldName) {
    const prompt = `Please enter ${fieldName}.`;
    appendMessage('System', prompt, 'system');
    speak(prompt);
}

function appendReviewList(resps) {
    appendMessage('System', '--- Review Your Filled Details ---', 'system');
    const lines = [];
    for (const key of sessionFields) {
        const val = (resps && key in resps) ? resps[key] : '';
        lines.push(`${key}: ${val}`);
    }
    appendMessage('System', lines.join('\n'), 'pre');
}

function renderConfirmationUI() {
    const wrapper = document.createElement('div');
    wrapper.className = 'confirm-actions';
    wrapper.style.display = 'flex';
    wrapper.style.gap = '8px';
    wrapper.style.margin = '8px 0';

    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes, all correct';
    yesBtn.className = 'btn btn-primary';

    const noBtn = document.createElement('button');
    noBtn.textContent = 'No, change a field';
    noBtn.className = 'btn btn-secondary';

    yesBtn.addEventListener('click', () => {
        appendMessage('User', 'Yes, all correct', 'user');
        reviewState = null;
        speak('Great. You can submit the form now.');
        appendMessage('System', 'Great! Click "Submit Form" to finalize.', 'system');
        submitFormBtn.style.display = 'inline-block';
    });

    noBtn.addEventListener('click', () => {
        appendMessage('User', 'No, change a field', 'user');
        reviewState = 'await_field_name';
        submitFormBtn.style.display = 'none';
        appendMessage('System', 'Which field is incorrect? Please type the exact field name.', 'system');
        speak('Which field is incorrect? Type the field name.');
    });

    chatContainer.appendChild(wrapper);
    wrapper.appendChild(yesBtn);
    wrapper.appendChild(noBtn);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Speak only the final confirmation line
    speak('Are these details correct? Say yes or no.');
}

async function refreshAndRenderReview() {
    if (!currentSessionId) return;
    try {
        const resp = await fetch('/get_session_state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: currentSessionId })
        });
        const data = await resp.json();
        if (!data.success) {
            appendMessage('System', 'Could not load current session state: ' + data.error, 'system');
            return;
        }
        responses = data.responses || {};
        appendReviewList(responses);
        appendMessage('System', 'Are these details correct?', 'system');
        renderConfirmationUI();
    } catch (e) {
        console.error(e);
        appendMessage('System', 'Network error loading session state.', 'system');
    }
}

// Unified handler for user text (typing or speech)
function handleUserText(text) {
    if (reviewMode) {
        handleReviewText(text);
    } else {
        sendAnswerToServer(text);
    }
}

function handleReviewText(text) {
    if (!reviewState) {
        // Ignore stray text when already confirmed
        return;
    }
    if (reviewState === 'await_field_name') {
        // user names a field to edit
        const picked = matchFieldName(text);
        if (!picked) {
            appendMessage('System', `Field "${text}" not found. Please type one of: ${sessionFields.join(', ')}`, 'system');
            return;
        }
        pendingFieldToEdit = picked;
        reviewState = 'await_new_value';
        appendMessage('System', `Enter new value for "${pendingFieldToEdit}".`, 'system');
        speak(`Enter new value for ${pendingFieldToEdit}`);
        return;
    }
    if (reviewState === 'await_new_value') {
        // validate and update on server
        validateSingleField(pendingFieldToEdit, text);
        return;
    }
    if (reviewState === 'await_confirm') {
        // if user typed yes/no instead of clicking buttons
        const v = text.trim().toLowerCase();
        if (['yes','y','correct','ok','okay','submit'].includes(v)) {
            reviewState = null;
            appendMessage('System', 'Great! Click "Submit Form" to finalize.', 'system');
            submitFormBtn.style.display = 'inline-block';
            speak('Great. You can submit the form now.');
        } else if (['no','n','change','edit','wrong','incorrect'].includes(v)) {
            reviewState = 'await_field_name';
            submitFormBtn.style.display = 'none';
            appendMessage('System', 'Which field is incorrect? Please type the exact field name.', 'system');
            speak('Which field is incorrect? Type the field name.');
        } else {
            appendMessage('System', 'Please reply Yes or No.', 'system');
        }
    }
}

function matchFieldName(userText) {
    const t = userText.trim().toLowerCase();
    // exact case-insensitive match first
    for (const f of sessionFields) {
        if (f.toLowerCase() === t) return f;
    }
    // startswith match (helpful for "ph" -> "Phone Number")
    for (const f of sessionFields) {
        if (f.toLowerCase().startsWith(t)) return f;
    }
    return null;
}

async function validateSingleField(fieldName, newValue) {
    if (!currentSessionId) return;
    try {
        const resp = await fetch('/validate_field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: currentSessionId,
                field_name: fieldName,
                value: newValue
            })
        });
        const data = await resp.json();
        if (data.success) {
            // update local responses and show refreshed preview
            responses = data.responses || responses;
            appendMessage('System', `Updated "${data.field}" to: ${data.validated_value}`, 'system');
            // Re-render review and ask confirm again
            reviewState = 'await_confirm';
            pendingFieldToEdit = null;
            appendMessage('System', '--- Updated Review ---', 'system');
            appendReviewList(responses);
            appendMessage('System', 'Are these details correct?', 'system');
            renderConfirmationUI();
        } else {
            appendMessage('System', 'Validation error: ' + data.error, 'system');
            // stay in await_new_value
        }
    } catch (e) {
        console.error(e);
        appendMessage('System', 'Network error updating field.', 'system');
    }
}

// Backend send for normal filling flow
async function sendAnswerToServer(text) {
    if (!currentSessionId) return appendMessage('System', 'Start a form session first.', 'system');

    try {
        const resp = await fetch('/process_input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: currentSessionId, answer: text })
        });
        const data = await resp.json();

        if (data.success) {

            if (data.message) appendMessage('System', data.message, 'system');

            if (data.validated_value !== undefined && sessionFields[sessionIndex]) {
                // store the server-validated value for the current field
                responses[sessionFields[sessionIndex]] = data.validated_value;
            }

            if (data.next_field) {
                sessionIndex = data.next_index;
                askNextFieldUI(data.next_field);
            }

            if (data.completed) {
                // Ensure last value captured if returned
                if (data.validated_value !== undefined && sessionFields[sessionIndex]) {
                    responses[sessionFields[sessionIndex]] = data.validated_value;
                }
                // Enter review mode
                reviewMode = true;
                reviewState = 'await_confirm';
                refreshAndRenderReview();
            }

        } else appendMessage('System', 'Validation error: ' + data.error, 'system');

    } catch {
        appendMessage('System', 'Network error sending answer.', 'system');
    }
}

// ✅ UPDATED appendMessage WITH ICONS
function appendMessage(sender, text, type = 'system') {
    const wrapper = document.createElement('div');
    wrapper.classList.add('message-wrapper');
    if (sender === 'User') wrapper.classList.add('user');

    const msg = document.createElement('div');
    msg.className = 'chat-message ' + type;
    msg.innerHTML = text;

    const icon = document.createElement('img');

    if (sender === 'User') {
        wrapper.appendChild(msg);
        wrapper.appendChild(icon);
        icon.src = USER_ICON;
        icon.classList.add('user-icon');
    } else {
        icon.src = BOT_ICON;
        icon.classList.add('bot-icon');
        wrapper.appendChild(icon);
        wrapper.appendChild(msg);
    }

    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Escape
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/&/g,"&amp;")
                 .replace(/</g,"&lt;")
                 .replace(/>/g,"&gt;");
}
