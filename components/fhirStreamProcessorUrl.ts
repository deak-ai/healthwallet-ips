import { AbstractStreamProcessor } from './fhirStreamProcessor';

export class UrlStreamProcessor extends AbstractStreamProcessor {
    async streamData(url: string): Promise<string> {
        console.log('Streaming data from: ', url);

        const response = await fetch(url, {
            // @ts-ignore
            reactNative: {
                textStreaming: true,
            },
        });

        if (!response.body) {
            throw new Error('ReadableStream not supported in this environment.');
        }

        const reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();
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

        return state.result;
    }
}
