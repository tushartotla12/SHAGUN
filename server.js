// require('dotenv').config({ path: './.env.local' });
const express = require('express');
const multer = require('multer');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(cors());

// Set up Multer to handle any file field for now (change back to `array` after testing)
const upload = multer({ dest: 'uploads/' }).any();

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
app.post('/upload', upload, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files were uploaded.' });
        }

        // Upload files to Google Drive
        const filePromises = req.files.map(file => {
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
        req.files.forEach(file => {
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
