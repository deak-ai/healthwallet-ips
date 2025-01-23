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
  private sessionCookie?: string;

  constructor(baseUrl: string, email: string, password: string) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.password = password;
  }

  private async fetchWithError(url: string, options: RequestInit = {}): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.sessionCookie ? { 'Cookie': this.sessionCookie } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    // Extract and store session cookie if present
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      this.sessionCookie = setCookie.split(';')[0];
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error: ${error.message}`);
    }

    if (response.status === 204) {
      return true;
    }

    return response.json();
  }

  async login(): Promise<LoginResponse> {
    // Clear any existing session cookie before login
    this.sessionCookie = undefined;

    return this.fetchWithError(`${this.baseUrl}/wallet-api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'email',
        email: this.email,
        password: this.password,
      }),
    });
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
    // Clear session cookie after logout
    this.sessionCookie = undefined;
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
