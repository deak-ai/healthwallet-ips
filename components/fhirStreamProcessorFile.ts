import { AbstractStreamProcessor} from './fhirStreamProcessor';

export class FileStreamProcessor extends AbstractStreamProcessor {
    async streamData(filePath: string): Promise<string> {
        console.log('Streaming data from file: ', filePath);

        const fs = require('fs').promises;
        const fileHandle = await fs.open(filePath, 'r');

        if (!fileHandle) {
            throw new Error('Unable to open file.');
        }

        const reader = {
            read: async () => {
                const { bytesRead, buffer } = await fileHandle.read(Buffer.alloc(1024));
                return { value: buffer.slice(0, bytesRead), done: bytesRead === 0 };
            }
        };
        const decoder = new TextDecoder();

        const state = this.createParserState();

        async function* streamGenerator() {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                yield decoder.decode(value, { stream: true });
            }
        }

        for await (const chunk of streamGenerator()) {
            this.processChunk(chunk, state);
        }

        await fileHandle.close();
        return state.result;
    }
}