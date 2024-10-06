import { StreamProcessor } from "./fhirStreamProcessor";
import { parser } from "stream-json";
import { chain } from "stream-chain";
import { pick } from "stream-json/filters/Pick";
import { Writable } from "stream";
import * as fs from 'fs';
import {streamArray} from "stream-json/streamers/StreamArray";

// Note this only works inside Node for testing

export class FhirFileStreamProcessor implements StreamProcessor {
    async streamData(source: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const sections: any[] = [];

            const pipeline = chain([
                fs.createReadStream(source),
                parser(),
                pick({ filter: 'entry' }), // Pick the 'entry' array from the top-level Bundle
                streamArray(), // Stream each entry in the array
                new Writable({
                    objectMode: true,
                    write({ value }, _, callback) {
                        const resource = value.resource;
                        // Check if the resource is a Composition and contains a section array
                        if (resource && resource.resourceType === "Composition" && Array.isArray(resource.section)) {
                            sections.push(...resource.section);
                        }
                        callback();
                    }
                })
            ]);

            pipeline.on('end', () => resolve(JSON.stringify(sections)));
            pipeline.on('error', reject);
        });
    }

}