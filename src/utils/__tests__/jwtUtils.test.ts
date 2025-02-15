import { decodeJwtToken } from '../jwtUtils';

describe('jwtUtils', () => {
  describe('decodeJwtToken', () => {
    it('should decode a valid JWT token', () => {
      // This is a sample JWT token with exp claim
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const decoded = decodeJwtToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.exp).toBe(1516239022);
    });

    it('should return empty object for invalid token', () => {
      const decoded = decodeJwtToken('invalid-token');
      expect(decoded).toEqual({});
    });

    it('should handle token without exp claim', () => {
      // This is a sample JWT token without exp claim
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZJ9DXeg4vd2zlT0';
      const decoded = decodeJwtToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.exp).toBeUndefined();
    });
  });
});
