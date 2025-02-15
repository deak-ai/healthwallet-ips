import { WaltIdIssuerApi, IssuanceRequest, OnboardingRequest } from '../waltIdIssuerApi';

describe('WaltIdIssuerApi Integration Tests', () => {
  const baseUrl = 'https://issuer.healthwallet.li';
  let api: WaltIdIssuerApi;

  beforeAll(() => {
    api = new WaltIdIssuerApi(baseUrl);
  });

  describe('Features', () => {
    it('should get registered features', async () => {
      const features = await api.getRegisteredFeatures();
      expect(features).toBeDefined();
      expect(typeof features).toBe('object');
    }, 30000); // Increased timeout for integration test
  });

  describe('Issuer Management', () => {
    it('should onboard issuer with Ed25519 key', async () => {
      const onboardingRequest: OnboardingRequest = {
        key: {
          backend: 'jwk',
          keyType: 'Ed25519'
        },
        did: {
          method: 'jwk'
        }
      };
      const result = await api.onboardIssuer(onboardingRequest);
      expect(result).toBeDefined();
      expect(result.issuerDid).toBeDefined();
      expect(result.issuerKey).toBeDefined();
    }, 30000);

    it('should onboard issuer with secp256k1 key', async () => {
      const onboardingRequest: OnboardingRequest = {
        key: {
          backend: 'jwk',
          keyType: 'secp256k1'
        },
        did: {
          method: 'jwk'
        }
      };
      const result = await api.onboardIssuer(onboardingRequest);
      expect(result).toBeDefined();
      expect(result.issuerDid).toBeDefined();
      expect(result.issuerKey).toBeDefined();
    }, 30000);

    it('should onboard issuer with default config when no request provided', async () => {
      const result = await api.onboardIssuer();
      expect(result).toBeDefined();
      expect(result.issuerDid).toBeDefined();
      expect(result.issuerKey).toBeDefined();
    }, 30000);
  });

  describe('Credential Issuance', () => {
    const testCredentialRequest: IssuanceRequest = {
      issuerKey: {
        type: 'jwk',
        jwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          d: 'mDhpwaH6JYSrD2Bq7Cs-pzmsjlLj4EOhxyI-9DM1mFI',
          kid: 'Vzx7l5fh56F3Pf9aR3DECU5BwfrY6ZJe05aiWYWzan8',
          x: 'T3T4-u1Xz3vAV2JwPNxWfs4pik_JLiArz_WTCvrCFUM'
        }
      },
      credentialConfigurationId: 'OpenBadgeCredential_jwt_vc_json',
      credentialData: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://purl.imsglobal.org/spec/ob/v3p0/context.json'
        ],
        id: 'urn:uuid:test-credential',
        type: ['VerifiableCredential', 'OpenBadgeCredential'],
        issuer: {
          type: ['Profile'],
          name: 'Test Issuer',
          url: 'https://test.issuer.com',
        },
        credentialSubject: {
          type: ['AchievementSubject'],
          achievement: {
            id: 'urn:uuid:test-achievement',
            type: ['Achievement'],
            name: 'Test Achievement',
            description: 'Test achievement description'
          }
        }
      },
      mapping: {
        id: '<uuid>',
        issuer: {
          id: '<issuerDid>'
        },
        credentialSubject: {
          id: '<subjectDid>'
        },
        issuanceDate: '<timestamp>',
        expirationDate: '<timestamp-in:365d>'
      },
      authenticationMethod: 'PRE_AUTHORIZED',
      issuerDid: 'did:key:z6MkjoRhq1jSNJdLiruSXrFFxagqrztZaXHqHGUTKJbcNywp'
    };

    it('should issue JWT credential', async () => {
      const result = await api.issueCredential(testCredentialRequest);
      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
    }, 30000);

    it('should issue batch of JWT credentials', async () => {
      const result = await api.issueCredentialBatch([testCredentialRequest]);
      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
    }, 30000);

    it('should issue SD-JWT credential', async () => {
      const result = await api.issueCredentialSDJWT(testCredentialRequest);
      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
    }, 30000);

    it('should fail to issue credential with invalid request', async () => {
      const invalidRequest = {
        issuerKey: {
          type: 'invalid',
          jwk: {
            kty: 'INVALID',
            crv: 'INVALID',
            d: 'INVALID',
            kid: 'INVALID',
            x: 'INVALID'
          }
        },
        credentialConfigurationId: 'INVALID',
        credentialData: {
          '@context': [],
          id: '',
          type: [],
          issuer: {},
          credentialSubject: {}
        },
        issuerDid: 'invalid:did'
      };
      await expect(api.issueCredential(invalidRequest as any)).rejects.toThrow('API Error');
    }, 30000);
  });
});
