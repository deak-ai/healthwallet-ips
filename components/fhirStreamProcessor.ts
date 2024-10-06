export interface StreamProcessor {
    streamData(source: string): Promise<string>;
}

import { JSONParser } from '@streamparser/json';

export abstract class AbstractStreamProcessor implements StreamProcessor {
    abstract getReader(source: string): Promise<AsyncIterableIterator<string>>;

    async streamData(source: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const reader = await this.getReader(source);
                const jsonParser = new JSONParser();
                const sections: any[] = [];

                jsonParser.onValue = (parsedElementInfo) => {
                    if (parsedElementInfo.key === 'section') {
                        sections.push(parsedElementInfo.value);
                    }
                };

                jsonParser.onError = reject;

                for await (const chunk of reader) {
                    try {
                        jsonParser.write(chunk);
                    } catch (error) {
                        reject(error);
                        return;
                    }
                }

                resolve(JSON.stringify(sections));
            } catch (error) {
                reject(error);
            }
        });
    }
}