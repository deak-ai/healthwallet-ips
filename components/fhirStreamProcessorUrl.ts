import { StreamProcessor } from './fhirStreamProcessor';
import { JSONParser } from '@streamparser/json';

export class FhirUrlStreamProcessor implements StreamProcessor {
    async streamData(url: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
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

                // Resolve the promise immediately when the section is found
                jsonParser.onValue = (parsedElementInfo) => {
                    if (parsedElementInfo.key === 'section') {
                        resolve(JSON.stringify(parsedElementInfo.value)); // Resolve when section is found
                        reader.cancel(); // Stop reading the stream
                    }
                };

                jsonParser.onError = (error) => {
                    reject(error);
                    reader.cancel(); // Stop the stream on error
                };

                // Read and process chunks manually
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;

                    if (value) {
                        const chunk = textDecoder.decode(value, { stream: true });
                        jsonParser.write(chunk);
                    }
                }

                // If no section is found and the stream ends, reject with an error
                reject(new Error('Section not found in the stream'));

            } catch (error) {
                reject(error);
            }
        });
    }
}


export class FhirUrlStreamProcessor1 implements StreamProcessor {
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


