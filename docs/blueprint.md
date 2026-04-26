# **App Name**: SnapText

## Core Features:

- Text Extraction: Allows users to upload an image and extract text in English, Hindi, or Marathi using Tesseract.js directly in the browser, providing a copyable digital output without translation.
- User Authentication: Enables users to log in securely using Firebase Authentication, supporting both Google and Email/Password options.
- Intuitive Image Upload: Provides an easy-to-use interface for uploading images via a button or drag-and-drop, with a visual loading indicator during OCR processing.
- Copyable Text Output: Displays the extracted text in a large, easily copyable textbox with a dedicated 'Copy Text' button, maintaining the original language and script.
- User Reviews System: Allows authenticated users to submit ratings and text reviews, which are securely stored in a Firestore database, and enables viewing of submitted reviews by all users.

## Style Guidelines:

- Primary color: A sophisticated, muted blue (#2E80B3) chosen to evoke a sense of professionalism and calm, perfect for focused tasks like text extraction.
- Background color: A very light, desaturated grey-blue (#F0F5F7), providing a clean and minimal canvas that enhances readability without distraction.
- Accent color: A vibrant aqua-cyan (#3ACBCB), creating a noticeable contrast with the primary and background, ideal for highlighting interactive elements and call-to-actions.
- Headline and body font: 'Inter', a modern grotesque sans-serif. Its objective, neutral, and highly readable design aligns perfectly with a clean and minimal interface.
- Use clear, line-based icons for common actions like 'Upload Image', 'Copy Text', and 'Login' to maintain the minimal aesthetic and ensure easy recognition.
- Implement a centered, single-column layout for the main OCR functionality, ensuring the focus remains on the image upload and text output areas. Use adequate whitespace to reinforce cleanliness.
- Incorporate subtle loading animations or progress indicators when an image is being processed by Tesseract.js, providing visual feedback without being intrusive.