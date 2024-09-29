
export async function fetchFhirResource(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

export async function fetchAndStream(url: string): Promise<string> {
    // Perform the fetch request with React Native specific textStreaming option
    console.log('Streaming data from: ', url);
    const response = await fetch(url, {
        // @ts-ignore
        reactNative: {
            textStreaming: true, // React Native specific option for streaming text
        },
    });

    // Ensure that the response body is available and of type ReadableStream<Uint8Array>
    if (!response.body) {
        throw new Error('ReadableStream not supported in this environment.');
    }

    // Get the ReadableStream from the response body
    const reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();
    const decoder = new TextDecoder(); // TextDecoder converts binary data to text
    let result = ''; // Initialize an empty string to accumulate the response

    // Process the stream in chunks
    let done = false;
    while (!done) {
        const {value, done: isDone} = await reader.read();
        console.log(value?.length)
        done = isDone;

        // If a chunk of data is received, decode and append it to the result string
        if (value) {
            result += decoder.decode(value, {stream: true});
        }
    }

    // Return the full result after the stream is processed
    return result;
}

export async function fetchAndStream2(url: string): Promise<string> {
    console.log('Streaming data from: ', url);

    const response = await fetch(url, {
        // @ts-ignore
        reactNative: {
            textStreaming: true,
        },
    });

    if (!response.body) {
        throw new Error('ReadableStream not supported in this environment.');
    }

    const reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    // Stateful variables for incremental parsing
    let buffer = ''; // Holds partial JSON data
    let result = ''; // Holds the final JSON without "div" elements
    let inQuote = false; // Track if we're inside a string
    let currentKey = ''; // Keep track of the current key being parsed
    let isInDivKey = false; // Whether we're inside the "div" key-value pair
    let skipValue = false; // Skip the value of the "div" key
    let lastNonWhitespaceChar = ''; // Track the last valid character processed

    // Helper function to skip over whitespace
    function skipWhitespace(buffer: string, index: number): number {
        while (index < buffer.length && /\s/.test(buffer[index])) {
            index++;
        }
        return index;
    }

    // Process the stream in chunks
    while (!done) {
        const { value, done: isDone } = await reader.read();

        done = isDone;

        if (value) {

            // Decode the incoming chunk of binary data
            const chunk = decoder.decode(value, { stream: true });

            //console.log(chunk.length)
            // Append the new chunk to the buffer and process it
            buffer += chunk;

            // Process the buffer character by character
            let i = 0;
            while (i < buffer.length) {
                const char = buffer[i];

                // Skip whitespace outside of quotes
                if (!inQuote && /\s/.test(char)) {
                    i++;
                    continue;
                }

                // Toggle inQuote state when encountering unescaped quotes
                if (char === '"' && (i === 0 || buffer[i - 1] !== '\\')) {
                    inQuote = !inQuote;
                    if (!inQuote) {
                        // We just finished reading a key or value
                        if (currentKey === 'div' && !isInDivKey) {
                            isInDivKey = true;
                            skipValue = true; // We'll skip the next value
                            currentKey = ''; // Reset the current key
                        } else if (!skipValue) {
                            result += `"${currentKey}"`; // Add the key to the result
                        }
                        currentKey = ''; // Reset after processing key
                    }
                } else if (inQuote) {
                    // Accumulate the current key if we're inside quotes
                    currentKey += char;
                } else if (char === ':' && isInDivKey) {
                    // If we encounter the colon after the "div" key, start skipping the value
                    skipValue = true;
                } else if (!inQuote && char === '}' && isInDivKey) {
                    // End of the "div" value; stop skipping
                    isInDivKey = false;
                    skipValue = false;

                    // If "div" was the last key-value pair, remove the trailing comma
                    result = result.trimEnd();
                    if (result.endsWith(',')) {
                        result = result.slice(0, -1); // Remove trailing comma
                    }

                    result += char; // Add the closing brace for the parent object
                } else if (!inQuote && !skipValue) {
                    // Append non-skipped characters to the result
                    result += char;

                    // Track the last non-whitespace character for handling trailing commas
                    lastNonWhitespaceChar = char;
                }

                i++;
            }

            // Clear the processed part of the buffer
            buffer = buffer.slice(i);
        }
    }

    return result;
}
