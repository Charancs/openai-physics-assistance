# Physics AI Assistant

A web application for JEE and NEET aspirants to get step-by-step solutions to physics problems, along with shortcuts where applicable.

## Features

- Process individual physics questions with detailed step-by-step solutions
- Support for image input (upload an image of a written question)
- Batch processing of multiple questions
- Export solutions as PDF or DOCX documents
- Clean and responsive user interface

## Technical Stack

- **Backend**: Python with Flask
- **Frontend**: HTML, CSS, JavaScript
- **AI**: OpenAI GPT models
- **Document Generation**: ReportLab (PDF) and python-docx (DOCX)
- **Image Processing**: Pillow and pytesseract for OCR

## Setup and Installation

### Prerequisites

- Python 3.8+ installed
- OpenAI API key
- Tesseract OCR installed (for image processing)

### Installation Steps

1. Clone this repository
   ```
   git clone <repository-url>
   cd Phy-Ai-Assistant
   ```

2. Install required packages
   ```
   pip install -r requirements.txt
   ```

3. Install Tesseract OCR:
   - For Windows: Download and install from [here](https://github.com/UB-Mannheim/tesseract/wiki)
   - For macOS: `brew install tesseract`
   - For Linux: `sudo apt install tesseract-ocr`

4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`
   - Optionally, specify the model: `OPENAI_MODEL=gpt-4o` (default)

5. Run the application
   ```
   python app.py
   ```

6. Open a web browser and navigate to `http://127.0.0.1:5000`

## Usage

### Single Question Mode

1. Enter your physics question in the text area or upload an image
2. Click "Get Solution" or "Process Image"
3. View the detailed step-by-step solution

### Batch Processing Mode

1. Enter a question in the text area
2. Click "Add Question"
3. Repeat steps 1-2 for all your questions
4. Click "Process All Questions"
5. View all solutions and export as needed

### Exporting Solutions

1. After processing questions, use the "Export as PDF" or "Export as DOCX" buttons
2. The document will be downloaded automatically

## License

MIT

## Acknowledgments

- OpenAI for providing the powerful GPT models
- The JEE and NEET community for inspiration
