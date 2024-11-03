import fs from 'fs-extra';
import express from 'express';
import multer from 'multer';
import path from 'path';
import File from './models/File.js';
import { randomBytes } from 'crypto';
import { zipFolder } from './utils/zip.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

function generateAccessKey() {
	return `xstro_md_${String(randomBytes(1).readUInt8(0)).padStart(2, '0')}_${String(randomBytes(1).readUInt8(0)).padStart(2, '0')}_${String(randomBytes(1).readUInt8(0)).padStart(2, '0')}`;
}

app.post('/upload', upload.array('files'), async (req, res) => {
	const accessKey = generateAccessKey();
	const tempDir = path.join(__dirname, 'temp', accessKey);
	fs.mkdirSync(tempDir, { recursive: true });

	req.files.forEach(file => {
		fs.writeFileSync(path.join(tempDir, file.originalname), file.buffer);
	});

	const zipFilePath = path.join(__dirname, 'uploads', `${accessKey}.zip`);

	try {
		await zipFolder(tempDir, zipFilePath);
		await File.create({ accessKey, filePath: zipFilePath });
		fs.rmdirSync(tempDir, { recursive: true });
		res.json({ accessKey });
	} catch (error) {
		console.error('Error during upload:', error);
		res.status(500).send('Failed to upload folder.');
	}
});

app.get('/download/:accessKey', async (req, res) => {
	const { accessKey } = req.params;
	const fileRecord = await File.findOne({ where: { accessKey } });

	if (!fileRecord) {
		return res.status(404).send('File not found.');
	}

	const zipFilePath = fileRecord.filePath;

	res.download(zipFilePath, err => {
		if (err) {
			console.error('Error downloading file:', err);
			res.status(500).send('Failed to download file.');
		}
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
