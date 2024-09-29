import {AbstractStreamProcessor, streamGenerator} from './fhirStreamProcessor';

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

        const reader = this.createReader(response.body.getReader());
        const decoder = new TextDecoder();
        const state = this.createParserState();

        for await (const chunk of streamGenerator(reader, decoder)) {
            this.processChunk(chunk, state);
        }

        return state.result;
    }

    // adapting the ReadableStreamDefaultReader to be compatible with the streamGenerator function
    private createReader(reader: ReadableStreamDefaultReader<Uint8Array>) {
        return {
            read: async () => {
                const {value, done} = await reader.read();
                return {value: value || new Uint8Array(), done};
            }
        };
    }
}