// require('dotenv').config({ path: './.env.local' });
const express = require('express');
const multer = require('multer');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS to allow cross-origin requests
app.use(cors());

// Set up Multer for file upload
const upload = multer({ dest: 'uploads/' });

// Google Drive authentication (Using a Service Account)
const serviceAccountCredentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString()
);

const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountCredentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// POST route to handle file uploads
app.post('/upload', upload.array('images', 10), async (req, res) => {
    try {
        const uploadedFiles = req.files;

        // Upload files to Google Drive
        const filePromises = uploadedFiles.map(file => {
            const fileMetadata = {
                name: file.originalname,
                parents: ['1MvY6adjJDLukF3exKZhexvdfK7HbQQvx'], // Replace with your folder ID in Google Drive
            };
            const media = {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path),
            };

            return drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });
        });

        // Wait for all files to be uploaded
        const fileResponses = await Promise.all(filePromises);
        
        // Clean up local uploaded files
        uploadedFiles.forEach(file => {
            fs.unlinkSync(file.path);
        });

        res.json({ message: 'Files uploaded successfully!', files: fileResponses.map(f => f.data.id) });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Error uploading files' });
    }
});

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});