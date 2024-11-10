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
const SERVICE_ACCOUNT_PATH = 'shagun-441304-4f6c2d45cbe9.json';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authenticateGoogleDrive = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_PATH,
        scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });
    return drive;
};

// POST route to handle file uploads
app.post('/upload', upload.array('images', 10), async (req, res) => {
    try {
        const drive = await authenticateGoogleDrive();
        const uploadedFiles = req.files;

        // Upload files to Google Drive
        const filePromises = uploadedFiles.map(file => {
            const fileMetadata = {
                name: file.originalname,
                parents: ['1MvY6adjJDLukF3exKZhexvdfK7HbQQvx'], // Replace with your folder ID in Google Drive
            };
            const media = {
                body: fs.createReadStream(file.path),
            };

            return drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });
        });

        // Wait for all files to be uploaded
        await Promise.all(filePromises);

        // Clean up local uploaded files
        uploadedFiles.forEach(file => {
            fs.unlinkSync(file.path);
        });

        res.json({ message: 'Files uploaded successfully!' });
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
