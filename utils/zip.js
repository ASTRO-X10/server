import fs from 'fs-extra';
import archiver from 'archiver';

export const zipFolder = (sourceFolder, out) => {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(out);
		const archive = archiver('zip', { zlib: { level: 9 } });

		output.on('close', () => resolve());
		archive.on('error', err => reject(err));
		archive.pipe(output);
		archive.directory(sourceFolder, false);
		archive.finalize();
	});
};
