/**
 * Decodes a JWT token and returns its payload
 * @param token The JWT token to decode
 * @returns The decoded payload or an empty object if decoding fails
 */
export function decodeJwtToken(token: string): { exp?: number } {
  try {
    const base64Payload = token.split('.')[1];
    // Make the base64 string URL safe
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    // Decode base64 to string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    // console.error('Error decoding JWT token:', error);
    return {};
  }
}
