import { AbstractStreamProcessor } from './fhirStreamProcessor';
import * as fs from 'fs';
import { createInterface } from 'readline';

export class FhirFileStreamProcessor extends AbstractStreamProcessor {
    async getReader(filePath: string): Promise<AsyncIterableIterator<string>> {
        const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        const rl = createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        return rl[Symbol.asyncIterator]();
    }
}
