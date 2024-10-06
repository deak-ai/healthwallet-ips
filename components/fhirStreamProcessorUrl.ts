import { StreamProcessor } from './fhirStreamProcessor';
import { JSONParser } from '@streamparser/json';

export class FhirUrlStreamProcessor implements StreamProcessor {
    async streamData(url: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const sections: any[] = [];

            try {
                // Fetch the response from the URL using streaming
                const response = await fetch(url, {
                    // @ts-ignore for textStreaming in React Native
                    reactNative: {
                        textStreaming: true,
                    },
                });

                if (!response.body) {
                    reject(new Error('No response body found'));
                    return;
                }

                const reader = response.body.getReader();
                const textDecoder = new TextDecoder(); // To decode chunks into strings
                let done = false;

                // Create JSON parser
                const jsonParser = new JSONParser();

                jsonParser.onValue = (parsedElementInfo) => {
                    if (parsedElementInfo.key === 'section') {
                        sections.push(parsedElementInfo.value);
                    }
                };


                jsonParser.onError = reject;

                // Read and process chunks manually
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;

                    if (value) {
                        const chunk = textDecoder.decode(value, { stream: true });
                        jsonParser.write(chunk);
                    }
                }

                resolve(JSON.stringify(sections));

            } catch (error) {
                reject(error);
            }
        });
    }
}


