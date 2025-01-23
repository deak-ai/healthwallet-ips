import { WaltIdWalletApi } from '../waltIdWalletApi';

describe('WaltIdWalletApi Integration Tests', () => {
  const baseUrl = 'https://wallet.healthwallet.li';
  const email = 'user@email.com';
  const password = 'password';
  let api: WaltIdWalletApi;

  beforeAll(() => {
    api = new WaltIdWalletApi(baseUrl, email, password);
  });

  describe('User Management', () => {
    it('should login and get user info', async () => {
      // Login
      const loginResult = await api.login();
      expect(loginResult).toBeDefined();
      expect(loginResult.username).toBe(email);
      expect(loginResult.token).toBeDefined();
      expect(loginResult.id).toBeDefined();

      // Get user ID
      const userId = await api.getUserId();
      expect(userId).toBeDefined();
    }, 30000); // Increased timeout for integration test

    it('should fail to login with wrong credentials', async () => {
      const wrongApi = new WaltIdWalletApi(baseUrl, 'wrong@email.com', 'wrongpass');
      await expect(wrongApi.login()).rejects.toThrow('API Error');
    });
  });

  describe('Wallet Management', () => {
    let walletId: string;

    beforeAll(async () => {
      await api.login(); // Ensure we're logged in
      const walletList = await api.getWallets();
      walletId = walletList.wallets[0]?.id;
      if (!walletId) {
        throw new Error('No wallet available for testing');
      }
    });

    it('should list wallets', async () => {
      const walletList = await api.getWallets();
      expect(walletList).toBeDefined();
      expect(Array.isArray(walletList.wallets)).toBe(true);
      expect(walletList.account).toBeDefined();
    });

    it('should list DIDs for a wallet', async () => {
      const dids = await api.getDids(walletId);
      expect(Array.isArray(dids)).toBe(true);
    });

    it('should query credentials', async () => {
      const credentials = await api.queryCredentials({
        id: walletId,
        sortBy: 'addedOn',
        showPending: false,
      });
      expect(Array.isArray(credentials)).toBe(true);
    });
  });


});
