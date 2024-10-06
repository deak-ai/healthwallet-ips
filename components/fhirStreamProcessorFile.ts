import { StreamProcessor } from './fhirStreamProcessor';
import { JSONParser } from '@streamparser/json';
import * as fs from 'fs';

export class FhirFileStreamProcessor implements StreamProcessor {
    async streamData(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const jsonParser = new JSONParser();

            // Create a read stream from the file
            const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

            // Set up the parser to capture sections
            jsonParser.onValue = (parsedElementInfo) => {
                // When the section key is fully parsed, resolve the promise with its value
                if (parsedElementInfo.key === 'section') {
                    resolve(JSON.stringify(parsedElementInfo.value)); // Resolve immediately when we find "section"
                    fileStream.destroy(); // Stop reading the file since we found the section
                }
            };

            jsonParser.onError = (error) => {
                fileStream.destroy(); // Stop reading on error
                reject(error);
            };

            // When the stream emits data, pass chunks to the JSON parser
            fileStream.on('data', (chunk) => {
                try {
                    jsonParser.write(chunk); // Write each chunk to the parser
                } catch (error) {
                    fileStream.destroy(); // Stop reading the file if there's an error
                    reject(error);
                }
            });

            // Handle stream errors
            fileStream.on('error', (error) => {
                reject(error);
            });

            // In case we reach the end of the stream without encountering "section"
            fileStream.on('end', () => {
                reject(new Error('Section not found in file'));
            });
        });
    }
}


export class FhirFileStreamProcessor1 implements StreamProcessor {
    async streamData(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const sections: any[] = [];
            const jsonParser = new JSONParser();

            // Create a read stream from the file
            const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });

            // Set up the parser to capture sections
            jsonParser.onValue = (parsedElementInfo) => {
                if (parsedElementInfo.key === 'section') {
                    sections.push(parsedElementInfo.value);
                }
            };

            jsonParser.onError = reject;

            // When the stream emits data, pass chunks to the JSON parser
            fileStream.on('data', (chunk) => {
                try {
                    jsonParser.write(chunk); // Write each chunk to the parser
                } catch (error) {
                    fileStream.destroy(); // Stop reading the file if there's an error
                    reject(error);
                }
            });

            // Handle stream end
            fileStream.on('end', () => {
                resolve(JSON.stringify(sections));
            });

            // Handle stream errors
            fileStream.on('error', (error) => {
                reject(error);
            });
        });
    }
}
