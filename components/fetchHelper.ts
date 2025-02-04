export async function streamingFetch(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    ...options,
    // @ts-ignore for textStreaming in React Native
    reactNative: {
      textStreaming: true,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return true;
  }

  if (!response.body) {
    throw new Error('No response body found');
  }

  const reader = response.body.getReader();
  const textDecoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        fullText += textDecoder.decode(value, { stream: true });
      }
    }
    // Final decode
    fullText += textDecoder.decode();

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return JSON.parse(fullText);
      } catch (e) {
        console.error('JSON Parse Error:', {
          url,
          error: e instanceof Error ? e.message : 'Unknown error',
          text: fullText,
        });
        throw e;
      }
    }
    return fullText;
  } finally {
    reader.releaseLock();
  }
}
