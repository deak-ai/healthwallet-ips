// API Models
export interface LoginRequest {
  type: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  username: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  type: string;
}

export interface WalletList {
  account: string;
  wallets: Wallet[];
}

export interface Wallet {
  id: string;
  name: string;
  createdOn: string;
  addedOn: string;
  permission: string;
}

export interface DidDetail {
  alias: string;
  createdOn: string;
  default: boolean;
  did: string;
  document: string;
  keyId: string;
}

export interface CredentialsQuery {
  id: string;
  sortBy?: string;
  showPending?: boolean;
  showDeleted?: boolean;
  sortDescending?: boolean;
}

export interface VerifiableCredential {
  id: string;
  wallet: string;
  addedOn: string;
  pending?: boolean;
  document: string;
  parsedDocument?: Record<string, any>;
}

export interface CredentialRequest {
  wallet: string;
  credentialId: string;
}

export interface OfferRequest {
  credentialOffer: string;
}

export interface UseOfferRequestParams {
  did?: string;
  wallet: string;
  requireUserInput?: boolean;
}

export class WaltIdWalletApi {
  private baseUrl: string;
  private email: string;
  private password: string;
  private authToken?: string;
  private tokenExpiry?: number;

  constructor(baseUrl: string, email: string, password: string) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.password = password;
  }

  private decodeJwtToken(token: string): { exp?: number } {
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

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    // Add 30 second buffer to handle network latency
    return Date.now() >= (this.tokenExpiry - 30) * 1000;
  }

  private async ensureValidToken(): Promise<void> {
    if (this.authToken && !this.isTokenExpired()) {
      return;
    }
    await this.login();
  }

  private async fetchWithError(url: string, options: RequestInit = {}): Promise<any> {
    // Skip token check for login request to avoid infinite recursion
    if (!url.endsWith('/auth/login')) {
      await this.ensureValidToken();
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const errorMessage = errorData.message || 'Request failed';
        const error = new Error(errorMessage);
        // Add status code to help identify the type of error
        (error as any).status = response.status;
        throw error;
      }

      if (response.status === 204) {
        return true;
      }

      return response.json();
    } catch (error) {
      // If it's already our error with status, rethrow it
      if (error instanceof Error && (error as any).status) {
        throw error;
      }
      // Otherwise wrap the error with more context
      throw new Error(`Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async login(): Promise<LoginResponse> {
    // Clear any existing auth token before login
    this.authToken = undefined;
    this.tokenExpiry = undefined;

    const response = await this.fetchWithError(`${this.baseUrl}/wallet-api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'email',
        email: this.email,
        password: this.password,
      }),
    });

    // Store the JWT token and its expiry for subsequent requests
    if (response.token) {
      this.authToken = response.token;
      const decoded = this.decodeJwtToken(response.token);
      this.tokenExpiry = decoded.exp;
    }

    return response;
  }

  async createUser(): Promise<boolean> {
    return this.fetchWithError(`${this.baseUrl}/wallet-api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: this.email,
        email: this.email,
        password: this.password,
        type: 'email',
      }),
    });
  }

  async getUserId(): Promise<string> {
    return this.fetchWithError(`${this.baseUrl}/wallet-api/auth/user-info`);
  }

  async logout(): Promise<boolean> {
    const result = await this.fetchWithError(`${this.baseUrl}/wallet-api/auth/logout`, {
      method: 'POST',
    });
    // Clear auth token and expiry after logout
    this.authToken = undefined;
    this.tokenExpiry = undefined;
    return result;
  }

  async getWallets(): Promise<WalletList> {
    return this.fetchWithError(`${this.baseUrl}/wallet-api/wallet/accounts/wallets`);
  }

  async getDids(walletId: string): Promise<DidDetail[]> {
    return this.fetchWithError(`${this.baseUrl}/wallet-api/wallet/${walletId}/dids`);
  }

  async queryCredentials(query: CredentialsQuery): Promise<VerifiableCredential[]> {
    const params = new URLSearchParams({
      ...(query.sortBy && { sortBy: query.sortBy }),
      ...(query.showPending !== undefined && { showPending: String(query.showPending) }),
      ...(query.showDeleted !== undefined && { showDeleted: String(query.showDeleted) }),
      ...(query.sortDescending !== undefined && { sortDescending: String(query.sortDescending) }),
    });

    return this.fetchWithError(
      `${this.baseUrl}/wallet-api/wallet/${query.id}/credentials?${params.toString()}`
    );
  }

  async getCredential(request: CredentialRequest): Promise<VerifiableCredential> {
    return this.fetchWithError(
      `${this.baseUrl}/wallet-api/wallet/${request.wallet}/credentials/${request.credentialId}`
    );
  }

  async useOfferRequest(request: OfferRequest, params: UseOfferRequestParams): Promise<VerifiableCredential[]> {
    const queryParams = new URLSearchParams();
    if (params.did) {
      queryParams.append('did', params.did);
    }
    if (params.requireUserInput !== undefined) {
      queryParams.append('requireUserInput', params.requireUserInput.toString());
    }

    return this.fetchWithError(
      `${this.baseUrl}/wallet-api/wallet/${params.wallet}/exchange/useOfferRequest?${queryParams.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: request.credentialOffer
      }
    );
  }

  async acceptCredential(request: CredentialRequest): Promise<boolean> {
    return this.fetchWithError(
      `${this.baseUrl}/wallet-api/wallet/${request.wallet}/credentials/${request.credentialId}/accept`,
      {
        method: 'POST',
      }
    );
  }

  async rejectCredential(request: CredentialRequest, reason: string): Promise<boolean> {
    return this.fetchWithError(
      `${this.baseUrl}/wallet-api/wallet/${request.wallet}/credentials/${request.credentialId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  }

  async resolvePresentationRequest(walletId: string, presentationRequest: string): Promise<string> {
    return this.fetchWithError(
      `${this.baseUrl}/wallet-api/wallet/${walletId}/exchange/resolvePresentationRequest`,
      {
        method: 'POST',
        body: JSON.stringify({ presentationRequest }),
      }
    );
  }

  async matchCredentials(
    walletId: string,
    presentationFilter: string | Record<string, any>
  ): Promise<VerifiableCredential[]> {
    const filterData =
      typeof presentationFilter === 'string'
        ? presentationFilter
        : JSON.stringify(presentationFilter);

    return this.fetchWithError(
      `${this.baseUrl}/wallet-api/wallet/${walletId}/exchange/matchCredentials`,
      {
        method: 'POST',
        body: JSON.stringify({ presentationFilter: filterData }),
      }
    );
  }
}
