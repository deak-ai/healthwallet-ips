import {AbstractStreamProcessor, streamGenerator} from './fhirStreamProcessor';
import {FileHandle} from "node:fs/promises";


export class FileStreamProcessor extends AbstractStreamProcessor {
    async streamData(filePath: string): Promise<string> {
        console.log('Streaming data from file: ', filePath);

        const fs = require('fs').promises;
        const fileHandle = await fs.open(filePath, 'r');

        if (!fileHandle) {
            throw new Error('Unable to open file.');
        }
        const reader = this.createReader(fileHandle);
        const decoder = new TextDecoder();

        const state = this.createParserState();
        for await (const chunk of streamGenerator(reader, decoder)) {
            this.processChunk(chunk, state);
        }

        await fileHandle.close();
        return state.result;
    }

    private createReader(fileHandle: FileHandle) {
        return {
            read: async () => {
                const {bytesRead, buffer} = await fileHandle.read(Buffer.alloc(1024));
                return {value: buffer.subarray(0, bytesRead), done: bytesRead === 0};
            }
        };
    }
}