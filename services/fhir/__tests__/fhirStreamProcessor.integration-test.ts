import {FhirFileStreamProcessor} from '@/services/fhir/fhirStreamProcessorFile';
import {FhirUrlStreamProcessor} from '@/services/fhir/fhirStreamProcessorUrl';

import fhirpath from 'fhirpath';


import { promises as fs } from 'fs';
import path from 'path';

// Define the unit test
test('FhirFileStreamProcessor.streamData should throw an error when the file does not exist', async () => {
    const fileProcessor = new FhirFileStreamProcessor()
    const nonExistentFilePath = path.join(__dirname, 'nonExistentFile.txt');
    console.log(__dirname)
    await expect(fileProcessor.streamData(nonExistentFilePath)).rejects.toThrow(
        'ENOENT: no such file or directory'
    );
});

// Define a function to measure memory consumption
async function measureMemoryConsumption<T>(func: () => Promise<T>): Promise<[T, number]> {
    // Measure the memory usage before executing the function
    const initialMemoryUsage = process.memoryUsage().heapUsed;

    // Execute the function and get the result
    const result = await func();

    // Measure the memory usage after executing the function
    const finalMemoryUsage = process.memoryUsage().heapUsed;

    // Calculate the memory consumption during function execution
    const memoryConsumption = finalMemoryUsage - initialMemoryUsage;

    // Return the result of the function and the memory consumption
    return [result, memoryConsumption];
}


test('FhirFileStreamProcessor.streamData should succeed parsing valid FHIR IPS file', async () => {
    // use a local ips file
    const ipsFile = path.join(__dirname+"/../../../resources", '801941-ips.json');

    const sectionProcessor = new FhirFileStreamProcessor()

    const [result, memoryConsumption] = await measureMemoryConsumption(() => sectionProcessor.streamData(ipsFile));

    const resultString = JSON.stringify(result.sections);
    console.log(resultString);
    expect(resultString.startsWith('[{"code')).toBeTruthy();
    expect(result.resources.length).toBeGreaterThan(546);

    // expect memory consumed to be less than the ips file size
    //const fileSize = (await fs.stat(ipsFile)).size;
    //expect(memoryConsumption).toBeLessThan(fileSize);

    console.log(`Memory consumption: ${memoryConsumption} bytes`);

});

test('FhirUrlStreamProcessor.streamData should succeed parsing from valid FHIR IPS url', async () => {

    //const ipsUrl = 'https://fhir.healthwallet.li/fhir/Patient/803565/$summary?_format=json'

    //const ipsUrl = 'http://localhost:8800/fhir-examples/ips-fhir/803565-ips.json'

    const ipsUrl = 'http://fhir-static.healthwallet.li/fhir-examples/ips-fhir/803565-ips.json'

    const sectionProcessor = new FhirUrlStreamProcessor()

    const [result, memoryConsumption] = await measureMemoryConsumption(() => sectionProcessor.streamData(ipsUrl));

    const resultString = JSON.stringify(result.sections);
    console.log(resultString);
    expect(resultString.startsWith('[{"code')).toBeTruthy();
    expect(result.resources.length).toBeGreaterThan(190);

    let titles = findKeysAtAnyDepth(result.sections, "title" ); 

    console.log(titles )

   let given = fhirpath.evaluate(result.resources[0].resource,
       "Patient.name.where(use='official').given.first()")

    console.log(given)

    let title = fhirpath.evaluate(result.sectionResource,
        "Composition.section.where(code.coding.code = '48765-2').title")

    console.log(title)


    console.log(`Memory consumption: ${memoryConsumption} bytes`);


},20000)



test('FhirPath expresssion should yield match', async () => {

    const ipsUrl = 'http://fhir-static.healthwallet.li/fhir-examples/ips-fhir/801941-ips.json'

    const sectionProcessor = new FhirUrlStreamProcessor()

    const [result, memoryConsumption] = await measureMemoryConsumption(() => sectionProcessor.streamData(ipsUrl));

    const resultString = JSON.stringify(result.sections);
    console.log(resultString);
    expect(resultString.startsWith('[{"code')).toBeTruthy();
    expect(result.resources.length).toBeGreaterThan(190);

    let titles = findKeysAtAnyDepth(result.sections, "title" );

    console.log(titles )

   let given = fhirpath.evaluate(result.resources[0].resource,
       "Patient.name.where(use='official').given.first()")

    console.log(given)

    let title = fhirpath.evaluate(result.sectionResource,
        "Composition.section.where(code.coding.code = '48765-2').title")

    console.log(title)


    console.log(`Memory consumption: ${memoryConsumption} bytes`);


},20000)


function findKeysAtAnyDepth(obj: any, targetKey: string): any[] {
    const results: any[] = [];

    // Helper function to recursively search
    function recursiveSearch(currentObj: any) {
        if (typeof currentObj !== 'object' || currentObj === null) {
            return;
        }

        // Loop through all the keys in the current object
        for (const key in currentObj) {
            if (currentObj.hasOwnProperty(key)) {
                if (key === targetKey) {
                    results.push(currentObj[key]);
                }

                // If the value is an object or an array, continue searching inside
                if (typeof currentObj[key] === 'object') {
                    recursiveSearch(currentObj[key]);
                }
            }
        }
    }

    // Start the recursive search
    recursiveSearch(obj);

    return results;
}
