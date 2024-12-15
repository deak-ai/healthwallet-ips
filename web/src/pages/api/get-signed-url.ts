import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const requestHeaders = new Headers();
    requestHeaders.set("xi-api-key", import.meta.env.ELEVENLABS_API_KEY);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=X8gItKgZWiF9FZh5CGax`,
      {
        method: "GET",
        headers: requestHeaders,
      }
    );

    if (!response.ok) {
      return new Response('Failed to get signed URL', {
        status: response.status
      });
    }

    const body = await response.json();
    return new Response(body.signed_url, {
      status: 200
    });
  } catch (error) {
    return new Response('Internal server error', {
      status: 500
    });
  }
}
