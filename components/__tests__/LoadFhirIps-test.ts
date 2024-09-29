import { FileStreamProcessor } from '../fhirStreamProcessorFile';
import { promises as fs } from 'fs';
import path from 'path';

// Define the unit test
test('readAndStream should throw an error when the file does not exist', async () => {
    const fileProcessor = new FileStreamProcessor()
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


test('readAndStream should succeed parsing valid file', async () => {
    // Create a large text file for testing
    const ipsFile = path.join(__dirname+"/../../resources", '801941-ips.json');

    const fileProcessor = new FileStreamProcessor()

    const [result, memoryConsumption] = await measureMemoryConsumption(() => fileProcessor.streamData(ipsFile));

    // expect the result to start with {"entry"
    expect(result.toString().startsWith('{"entry"')).toBeTruthy();

    // expect memory consumed to be less than the ips file size
    const fileSize = (await fs.stat(ipsFile)).size;
    //expect(memoryConsumption).toBeLessThan(fileSize);

    console.log(`Memory consumption: ${memoryConsumption} bytes`);

});