
# Automated Voice Based Form Filling System

An automated voice based form filling system which uses speech recognition to provide increased accessibility for users while improving their convenience level. The system utilizes speech recognition techniques to convert spoken language into text and automatically populate form fields. The system will interpret the spoken input, extract relevant information, and fill the corresponding form fields. Such systems enable users to input responses using voice commands, eliminating the manual input method and preventing human errors. 

## Methodology 

This system simplifies form filling through voice interaction, combining Speech Recognition, NLP, Text-to-Speech, and real-time data validation. It guides users through the form using spoken instructions, making it highly accessible—especially for visually impaired or less tech-savvy individuals.

### User Notification
The system starts by giving users clear voice and text instructions on how to use it—how to enter data, skip fields, or repeat prompts—ensuring a smooth and guided experience from start to finish.


### Speech Recognition
Uses Google’s Speech Recognition API to convert voice input into text. It displays spoken data in real-time, applying noise reduction and adaptive listening to improve accuracy and user experience.

### Input Processing
Processes and maps recognized text to fields like Name, Age, Email, etc. It handles varied speech patterns, applies grammar corrections, and normalizes text for clean, accurate data entry.

### Data Validation
Validates inputs using regular expressions and preset rules. Incorrect entries are flagged immediately, and users are prompted to correct them on the spot for accurate, reliable form filling.

### Error Handling
Offers voice-based error correction and lets users skip fields, retry inputs, or exit anytime. Entries are displayed for review before final submission, allowing users to fix any issues.

### Document Generation
Automatically generates a well-structured Word document and converts it into PDF format. Final confirmation is taken before saving and displaying the document for download or sharing.

## Results

Our Automated Voice Based Form Filling System successfully integrates Speech Recognition, Text to Speech (TTS), Input Validation, and Document Generation to simplify the form filling process. The system is able to accurately recognize voice input, validate fields such as names, phone numbers, and email addresses and correct errors. 
The system successfully tested with multiple users providing voice inputs for fields like Name, Age, Gender and much more. The system maintains data accuracy by finding errors in incomplete entries during the process of data submission. It allows users to verify and confirm the details, if any error is found then the user can repeat the process, this ensures a robust and error free form filling process. Commands like Skip, Stop, and Repeat message make the system intuitive. Form is saved in both DOCX and PDF formats. Users found the system intuitive and useful, especially for accessibility and convenience.

### Example
The form was successfully filled using voice input with the following details: Name – Samrudh Dhondi, Age – 21, and Gender – Male. These inputs were recognized accurately, confirmed by the user, and then saved into a Word document, which was further converted into a PDF for easy access and sharing.

## Outputs

<img src="https://github.com/user-attachments/assets/bfdb1da4-fb66-429a-b525-4a0ae2221788" alt="message" width="600"/>
<img src="https://github.com/user-attachments/assets/4d742c01-9562-4abf-9e6a-3bd19d1b1f4d" alt="output" width="500"/>
<img src="https://github.com/user-attachments/assets/319b181f-2c4c-44b4-b9ce-7cdde630b3d5" alt="form" width="300"/>

