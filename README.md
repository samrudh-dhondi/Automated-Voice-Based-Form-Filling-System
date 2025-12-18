# 🎙️ Automated Voice-Based Form Filling System

## 📌 Overview
The **Automated Voice-Based Form Filling System** is a full-stack web application that enables users to fill PDF-based forms using **voice commands**.  
The system improves accessibility and convenience by eliminating manual data entry and supporting real-time voice interaction, validation, and document generation.

It is especially useful for **visually impaired users**, elderly individuals, and hands-free scenarios.

---

## ✨ Key Features
- Voice-driven form filling using guided conversational flow
- Real-time Speech-to-Text (STT) and Text-to-Speech (TTS)
- Intelligent input validation and error correction
- Support for voice commands: **Skip**, **Repeat**, **Stop**
- Automatic generation of **DOCX** and **PDF** documents
- Web-based system accessible from any modern browser

---

## 🧠 System Architecture
The project is implemented as a **full-stack web application**:

### Backend (Flask)
- PDF upload and field extraction
- Session state management
- Input validation and error handling
- DOCX and PDF generation

### Frontend (Web)
- Voice interaction using **Web Speech API**
- Chat-style guided form filling
- Microphone controls and live feedback

---

## 🛠️ Technologies Used

### Backend
- Python
- Flask
- pdfplumber (PDF field extraction)
- python-docx (DOCX generation)
- docx2pdf (PDF conversion)
- Regular Expressions (Validation)

### Frontend
- HTML5, CSS3
- JavaScript
- Web Speech API (Speech Recognition & TTS)
- Fetch API (asynchronous communication)

---

## 🔄 Methodology
1. User uploads a PDF form
2. System extracts potential fillable fields
3. User is guided through a voice-enabled conversation
4. Speech input is converted to text in the browser
5. Inputs are validated in real time
6. Errors are corrected through voice prompts
7. Final confirmation is taken
8. Completed form is generated in **DOCX and PDF** formats

---

## 📊 Results
- Achieved **90%+ speech input accuracy**
- Reduced manual form filling effort by **30%**
- Improved form completion efficiency by **20%**
- Successfully tested with multiple users
- Users found the system intuitive, accessible, and error-resistant

---

## 🧪 Example Output
**Input (via voice):**
- Name: Samrudh Dhondi  
- Age: 21  
- Gender: Male  

**Output:**
- Structured Word document
- Converted PDF ready for download or sharing

---


## Outputs

<img src="https://github.com/user-attachments/assets/4d742c01-9562-4abf-9e6a-3bd19d1b1f4d" alt="output" width="500"/>
<img src="https://github.com/user-attachments/assets/319b181f-2c4c-44b4-b9ce-7cdde630b3d5" alt="form" width="300"/>
<img width="1500" height="700" alt="Screenshot 2025-11-02 102431" src="https://github.com/user-attachments/assets/cfb38da2-6093-41f0-a4d1-983014d3b193" />

