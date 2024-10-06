import { AbstractStreamProcessor } from './fhirStreamProcessor';

export class FhirUrlStreamProcessor extends AbstractStreamProcessor {
    async getReader(url: string): Promise<AsyncIterableIterator<string>> {
        const response = await fetch(url, {
            // @ts-ignore for textStreaming in React Native
            reactNative: {
                textStreaming: true,
            },
        });

        if (!response.body) {
            throw new Error('No response body found');
        }

        const reader = response.body.getReader();
        const textDecoder = new TextDecoder();

        async function* streamReader() {
            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    yield textDecoder.decode(value, { stream: true });
                }
            }
        }

        return streamReader();
    }
}

