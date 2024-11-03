## EXPRESS FILE SAVER (ZIP)

This is a simple Express server that allows users to upload `.zip` files and retrieve them using a generated access key.

### WHY IT'S MADE

- Upload `.zip` files
- Generate access keys in the format `xstro_md_XX_XX_XX`
- Download files using access keys

### USAGE

#### UPLOAD FOLDER

```javascript
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const uploadFolder = async folderPath => {
	const form = new FormData();
	const files = fs.readdirSync(folderPath);

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const fileBuffer = fs.readFileSync(filePath);
		form.append('files', fileBuffer, { filename: file });
	}

	try {
		const response = await axios.post('http://localhost:5000/upload', form, {
			headers: {
				...form.getHeaders(),
			},
		});
		console.log('Access Key:', response.data.accessKey);
	} catch (error) {
		console.error('Error uploading folder:', error.message);
	}
};

uploadFolder('./folder');
```

#### DOWNLOAD WITH ACCESS KEY

```javascript
import axios from 'axios';
import fs from 'fs';
import unzipper from 'unzipper';
import path from 'path';

const downloadAndExtract = async (accessKey, extractPath) => {
	try {
		const response = await axios.get(`http://localhost:5000/download/${accessKey}`, {
			responseType: 'stream',
		});

		const zipFilePath = path.join(extractPath, `${accessKey}.zip`);
		const writer = fs.createWriteStream(zipFilePath);
		response.data.pipe(writer);

		writer.on('finish', () => {
			fs.createReadStream(zipFilePath)
				.pipe(unzipper.Extract({ path: extractPath }))
				.on('close', () => {
					console.log(`Files Extracted to: ${extractPath}`);
					fs.unlinkSync(zipFilePath);
				});
		});

		writer.on('error', err => {
			console.error('Error writing file:', err.message);
		});
	} catch (error) {
		console.error('Error downloading file:', error.message);
	}
};

const accessKey = 'xstro_md_XX_XX_XX';
const extractPath = 'path/to/extract/folder';
downloadAndExtract(accessKey, extractPath);
```

### MADE BY ASTRO
