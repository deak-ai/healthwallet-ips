export interface StreamProcessor {
    streamData(source: string): Promise<string>;
}

export async function* streamGenerator(reader: { read: () => Promise<{ value: Uint8Array, done: boolean }> }, decoder: TextDecoder) {
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
    }
}

const DIV_ELEMENT = 'div';

export abstract class AbstractStreamProcessor implements StreamProcessor {
    abstract streamData(source: string): Promise<string>;


    protected createParserState() {
        return {
            buffer: '',
            result: '',
            inQuote: false,
            currentKey: '',
            isInDivKey: false,
            skipValue: false,
        };
    }

    protected processChunk(chunk: string, state: ReturnType<typeof this.createParserState>) {
        state.buffer += chunk;

        let i = 0;
        while (i < state.buffer.length) {
            const char = state.buffer[i];

            if (!state.inQuote && /\s/.test(char)) {
                i++;
                continue;
            }

            if (char === '"' && (i === 0 || state.buffer[i - 1] !== '\\')) {
                this.handleQuote(state);
            } else if (state.inQuote) {
                state.currentKey += char;
            } else if (char === ':' && state.isInDivKey) {
                state.skipValue = true;
            } else if (!state.inQuote && char === '}' && state.isInDivKey) {
                this.handleClosingBrace(state);
            } else if (!state.inQuote && !state.skipValue) {
                state.result += char;
            }

            i++;
        }

        state.buffer = state.buffer.slice(i);
    }

    private handleQuote(state: ReturnType<typeof this.createParserState>) {
        state.inQuote = !state.inQuote;
        if (!state.inQuote) {
            if (state.currentKey === DIV_ELEMENT && !state.isInDivKey) {
                state.isInDivKey = true;
                state.skipValue = true;
                state.currentKey = '';
            } else if (!state.skipValue) {
                state.result += `"${state.currentKey}"`;
            }
            state.currentKey = '';
        }
    }

    private handleClosingBrace(state: ReturnType<typeof this.createParserState>) {
        state.isInDivKey = false;
        state.skipValue = false;

        state.result = state.result.trimEnd();
        if (state.result.endsWith(',')) {
            state.result = state.result.slice(0, -1); // Remove trailing comma
        }

        state.result += '}';
    }
}

