import { JSONParser } from '@streamparser/json';
import {IpsData, FhirResource} from "@/components/fhirIpsModels";

export interface StreamProcessor {
    streamData(source: string): Promise<IpsData>;
}

export abstract class AbstractStreamProcessor implements StreamProcessor {

    abstract getReader(source: string): Promise<AsyncIterableIterator<string>>;

    async streamData(source: string): Promise<IpsData> {
        return new Promise(async (resolve, reject) => {
            try {
                const reader = await this.getReader(source);
                const jsonParser = new JSONParser();
                let ipsData: IpsData = { sectionResource: {} as FhirResource, sections: [], resources: [] };

                jsonParser.onValue = (parsedElementInfo) => {
                    if (parsedElementInfo.key === 'resource'
                        && typeof parsedElementInfo.value === 'object'
                        && parsedElementInfo.value !== null) {
                        const resource = parsedElementInfo.value as { resourceType?: string; section?: any[] };
                        if (resource.resourceType === 'Composition' && Array.isArray(resource.section)) {
                            ipsData.sectionResource = resource as FhirResource;
                            ipsData.sections = resource.section;
                        } else {
                            // need to add the parent as it as the fullUrl next to the resource
                            ipsData.resources.push(parsedElementInfo.parent as FhirResource);
                        }
                    }
                }

                jsonParser.onError = reject;

                for await (const chunk of reader) {
                    try {
                        jsonParser.write(chunk);
                    } catch (error) {
                        reject(error);
                        return;
                    }
                }

                resolve(ipsData);
            } catch (error) {
                reject(error);
            }
        });
    }
}