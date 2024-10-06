export interface StreamProcessor {
    streamData(source: string): Promise<string>;
}
