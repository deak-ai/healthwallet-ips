
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
    const state = {
        buffer: '', // Holds partial JSON data
        result: '', // Holds the final JSON without "div" elements
        inQuote: false, // Track if we're inside a string
        currentKey: '', // Keep track of the current key being parsed
        isInDivKey: false, // Whether we're inside the "div" key-value pair
        skipValue: false, // Skip the value of the "div" key
    };

    // Process the stream in chunks
    while (!done) {
        const { value, done: isDone } = await reader.read();

        done = isDone;

        if (value) {

            // Decode the incoming chunk of binary data
            const chunk = decoder.decode(value, { stream: true });

            //console.log(chunk.length)
            // Append the new chunk to the buffer and process it
            state.buffer += chunk;

            // Process the buffer character by character
            let i = 0;
            while (i < state.buffer.length) {
                const char = state.buffer[i];

                // Skip whitespace outside of quotes
                if (!state.inQuote && /\s/.test(char)) {
                    i++;
                    continue;
                }

                // Toggle inQuote state when encountering unescaped quotes
                if (char === '"' && (i === 0 || state.buffer[i - 1] !== '\\')) {
                    state.inQuote = !state.inQuote;
                    if (!state.inQuote) {
                        // We just finished reading a key or value
                        if (state.currentKey === 'div' && !state.isInDivKey) {
                            state.isInDivKey = true;
                            state.skipValue = true; // We'll skip the next value
                            state.currentKey = ''; // Reset the current key
                        } else if (!state.skipValue) {
                            state.result += `"${state.currentKey}"`; // Add the key to the result
                        }
                        state.currentKey = ''; // Reset after processing key
                    }
                } else if (state.inQuote) {
                    // Accumulate the current key if we're inside quotes
                    state.currentKey += char;
                } else if (char === ':' && state.isInDivKey) {
                    // If we encounter the colon after the "div" key, start skipping the value
                    state.skipValue = true;
                } else if (!state.inQuote && char === '}' && state.isInDivKey) {
                    // End of the "div" value; stop skipping
                    state.isInDivKey = false;
                    state.skipValue = false;

                    // If "div" was the last key-value pair, remove the trailing comma
                    state.result = state.result.trimEnd();
                    if (state.result.endsWith(',')) {
                        state.result = state.result.slice(0, -1); // Remove trailing comma
                    }

                    state.result += char; // Add the closing brace for the parent object
                } else if (!state.inQuote && !state.skipValue) {
                    // Append non-skipped characters to the result
                    state.result += char;
                }

                i++;
            }

            // Clear the processed part of the buffer
            state.buffer = state.buffer.slice(i);
        }
    }

    return state.result;
}
