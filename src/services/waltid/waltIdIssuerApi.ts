// API Models
export interface IssuerKey {
  type: string;
  jwk: Jwk;
}

export interface Jwk {
  kty: string;
  crv: string;
  d: string;
  kid: string;
  x: string;
  y?: string;
}

export interface CredentialDataV1 {
  "@context": string[];
  id: string;
  resourceId?: string;
  type: string[];
  issuer: Issuer;
  issuanceDate?: string;
  issued?: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
}

export interface Issuer {
  id?: string;
  type?: string[];
  name?: string;
  url?: string;
  image?: string;
}

export interface CredentialSubject {
  id?: string;
  type?: string[];
  [key: string]: any; // Allow for dynamic credential subject data
}

export interface Mapping {
  id?: string;
  issuer?: {
    id?: string;
  };
  credentialSubject?: {
    id?: string;
  };
  issuanceDate?: string;
  issued?: string;
  expirationDate?: string;
}

export interface IssuanceRequest {
  issuerKey: IssuerKey;
  credentialConfigurationId: string;
  credentialData: CredentialDataV1;
  mapping?: Mapping;
  authenticationMethod?: 'PRE_AUTHORIZED' | 'ID_TOKEN' | 'VP_TOKEN' | 'PWD';
  issuerDid: string;
  vpRequestValue?: string;
  vpProfile?: string;
}

export interface IssuanceResponse {
  url: string;
  credential?: any;
}

export interface RegisteredFeatures {
  [key: string]: string;
}

export interface KeyConfig {
  backend: 'jwk' | 'tse' | 'oci' | 'oci-rest-api';
  keyType: 'Ed25519' | 'secp256r1' | 'secp256k1' | 'RSA';
  config?: Record<string, any>;
}

export interface DidConfig {
  method: 'jwk' | 'key' | 'web';
  config?: {
    domain?: string;
    path?: string;
  };
}

export interface OnboardingRequest {
  key: KeyConfig;
  did: DidConfig;
}

export interface OnboardingResponse {
  issuerDid: string;
  issuerKey: any; // Using 'any' for now as it maps to kotlinx.serialization.json.JsonElement in the swagger
}

export interface OfferRequest {
  did: string;
  walletId: string;
  credentialOffer: string;
}

import { streamingFetch } from '../../utils/fetchHelper';

export class WaltIdIssuerApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithError(url: string, options: RequestInit = {}): Promise<any> {
    try {
      return await streamingFetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      console.error('API Call Failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Get list of registered features from the issuer
   * @returns Promise<RegisteredFeatures>
   */
  async getRegisteredFeatures(): Promise<RegisteredFeatures> {
    return this.fetchWithError(`${this.baseUrl}/features/registered`);
  }

  /**
   * Onboard a new issuer
   * @param request The onboarding request configuration
   * @returns Promise<OnboardingResponse>
   */
  async onboardIssuer(request: OnboardingRequest = {
    key: {
      backend: 'jwk',
      keyType: 'Ed25519'
    },
    did: {
      method: 'jwk'
    }
  }): Promise<OnboardingResponse> {
    return this.fetchWithError(`${this.baseUrl}/onboard/issuer`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Issues a JWT credential using OpenID4VC
   * @param request The issuance request
   * @returns Promise<IssuanceResponse>
   */
  async issueCredential(request: IssuanceRequest): Promise<IssuanceResponse> {
    const response = await this.fetchWithError(`${this.baseUrl}/openid4vc/jwt/issue`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return typeof response === 'string' ? { url: response } : response;
  }

  /**
   * Issues multiple JWT credentials in a batch
   * @param requests Array of issuance requests
   * @returns Promise<IssuanceResponse>
   */
  async issueCredentialBatch(requests: IssuanceRequest[]): Promise<IssuanceResponse> {
    const response = await this.fetchWithError(`${this.baseUrl}/openid4vc/jwt/issueBatch`, {
      method: 'POST',
      body: JSON.stringify(requests),
    });
    return typeof response === 'string' ? { url: response } : response;
  }

  /**
   * Issues a credential using SD-JWT format
   * @param request The issuance request
   * @returns Promise<IssuanceResponse>
   */
  async issueCredentialSDJWT(request: IssuanceRequest): Promise<IssuanceResponse> {
    const response = await this.fetchWithError(`${this.baseUrl}/openid4vc/sdjwt/issue`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return typeof response === 'string' ? { url: response } : response;
  }
}
