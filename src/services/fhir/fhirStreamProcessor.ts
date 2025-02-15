import { JSONParser } from '@streamparser/json';
import {IpsData, FhirResource, FhirResourceWrapper, IpsDataImpl} from "./fhirIpsModels";

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
                let ipsData = new IpsDataImpl({} as FhirResource, [], []);

                jsonParser.onValue = (parsedElementInfo) => {
                    if (parsedElementInfo.key === 'resource'
                        && typeof parsedElementInfo.value === 'object'
                        && parsedElementInfo.value !== null) {
                        const resource = parsedElementInfo.value as { resourceType?: string; section?: any[] };
                        if (resource.resourceType === 'Composition' && Array.isArray(resource.section)) {
                            ipsData.sectionResource = resource as FhirResource;
                            ipsData.sections = resource.section;
                        } else {
                            // Type guard to ensure parent has the required FhirResourceWrapper structure
                            const parent = parsedElementInfo.parent;
                            if (parent && typeof parent === 'object' && 
                                'fullUrl' in parent && 
                                'resource' in parent &&
                                typeof parent.fullUrl === 'string' &&
                                typeof parent.resource === 'object' &&
                                parent.resource !== null) {
                                const wrapper: FhirResourceWrapper = {
                                    fullUrl: parent.fullUrl,
                                    resource: parent.resource as FhirResource
                                };
                                ipsData.resources.push(wrapper);
                            }
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