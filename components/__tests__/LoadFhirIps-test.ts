import {FhirFileStreamProcessor} from '../fhirStreamProcessorFile';
import {FhirUrlStreamProcessor} from '../fhirStreamProcessorUrl';


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
    // Create a large text file for testing
    const ipsFile = path.join(__dirname+"/../../resources", '801941-ips.json');

    const sectionProcessor = new FhirFileStreamProcessor()

    const [result, memoryConsumption] = await measureMemoryConsumption(() => sectionProcessor.streamData(ipsFile));

    const resultString = result.toString();
    console.log(resultString);
    expect(resultString.startsWith('[[{"code"')).toBeTruthy();

    // expect memory consumed to be less than the ips file size
    //const fileSize = (await fs.stat(ipsFile)).size;
    //expect(memoryConsumption).toBeLessThan(fileSize);

    console.log(`Memory consumption: ${memoryConsumption} bytes`);

});

test('FhirUrlStreamProcessor.streamData should succeed parsing from valid FHIR IPS url', async () => {
    const sectionProcessor = new FhirUrlStreamProcessor()

    const result = await sectionProcessor.streamData(
        'https://fhir.healthwallet.li/fhir/Patient/803565/$summary?_format=json')

    const resultString = result.toString();
    console.log(resultString);
    expect(resultString.startsWith('[[{"title"')).toBeTruthy();


},20000)



