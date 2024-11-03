import express from 'express';
import path from 'path';
import File from './models/File.js';
import { randomBytes } from 'crypto';
import { zipFolder } from './utils/zip.js';

const app = express();
const PORT = process.env.PORT || 5000;

function generateAccessKey() {
	return `xstro_md_${String(randomBytes(1).readUInt8(0)).padStart(2, '0')}_${String(randomBytes(1).readUInt8(0)).padStart(2, '0')}_${String(randomBytes(1).readUInt8(0)).padStart(2, '0')}`;
}

app.post('/upload', async (req, res) => {
	const folderPath = req.body.folderPath;
	const accessKey = generateAccessKey();
	const zipFilePath = path.join(__dirname, `uploads/${accessKey}.zip`);

	await zipFolder(folderPath, zipFilePath);
	await File.create({ accessKey, filePath: zipFilePath });

	res.json({ accessKey });
});

app.get('/download/:accessKey', async (req, res) => {
	const fileRecord = await File.findOne({ where: { accessKey: req.params.accessKey } });

	if (fileRecord) {
		res.download(fileRecord.filePath);
	} else {
		res.status(404).send('File not found.');
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
