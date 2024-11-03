import { promises as fs } from 'fs';
import AdmZip from 'adm-zip';
import path from 'path';

export const zipFolder = async (folderPath, zipFilePath) => {
	const zip = new AdmZip();
	const files = await fs.readdir(folderPath);

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		zip.addLocalFile(filePath);
	}

	zip.writeZip(zipFilePath);
};
