import { WaltIdWalletApi } from '../waltIdWalletApi';

describe('WaltIdWalletApi Integration Tests', () => {
  const baseUrl = 'https://wallet.healthwallet.li';
  const email = 'user1@email.com';
  const password = 'password1';  
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


  describe('Wallet Synchronization', () => {
    let walletId: string;

    beforeAll(async () => {
      await api.login(); // Ensure we're logged in
      const walletList = await api.getWallets();
      walletId = walletList.wallets[0]?.id;
      if (!walletId) {
        throw new Error('No wallet available for testing');
      }
    });

    it('should query smart health cards only', async () => {
      // const credential = await api.getCredential({
      //   wallet: walletId,
      //   credentialId: 'urn:uuid:bc58b985-f414-4565-b412-7ad83bd4a3e6'
      // })


      const credentials = await api.queryCredentials({
        category: ['SmartHealthCard'],
        id: walletId,
        sortBy: 'addedOn',
        showPending: false,
      });

      expect(credentials).toBeDefined();
      console.log(credentials);

      // expect 2 credentials
      expect(credentials.length).toBe(2);
      const credential = credentials[0];

      expect(credential.id).toBe('urn:uuid:bc58b985-f414-4565-b412-7ad83bd4a3e6');
      expect(credential.document).toBeDefined();
      const decoded = api.decodeJwtToken(credential.document) as any;
      expect(decoded).toBeDefined();
      console.log(decoded);
      
      const fullUrl = decoded.vc.credentialSubject.fhirBundle.entry[0].fullUrl;
      expect(fullUrl).toBeDefined();
      console.log(fullUrl);
    });

    it('should get categories from wallet', async () => {
      // First add a test category
      const testCategory = 'TestCategory_' + Date.now();
      await api.addCategory(walletId, testCategory);

      // Get all categories
      const categories = await api.getCategories(walletId);
      
      // Verify results
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.map(c => c.name)).toContain(testCategory);
      expect(categories.map(c => c.name)).toContain('SmartHealthCard');


      // now do an api.attachCategory of the testCategory to the following credential urn:uuid:bc58b985-f414-4565-b412-7ad83bd4a3e6
      await api.attachCategories(walletId, 'urn:uuid:bc58b985-f414-4565-b412-7ad83bd4a3e6', [testCategory, 'SmartHealthCard']);

      // now query credentials by category of testCategory
      const credentials = await api.queryCredentials({
        category: [testCategory],
        id: walletId,
        sortBy: 'addedOn',
        showPending: false,
      });
      expect(credentials).toBeDefined();
      expect(Array.isArray(credentials)).toBe(true);
      expect(credentials.length).toBe(1);
      expect(credentials[0].id).toBe('urn:uuid:bc58b985-f414-4565-b412-7ad83bd4a3e6');


      // now detach the category
      await api.detachCategories(walletId, 'urn:uuid:bc58b985-f414-4565-b412-7ad83bd4a3e6', [testCategory]);




      // Test deletion
      await api.deleteCategory(walletId, testCategory);
      const categoriesAfterDelete = await api.getCategories(walletId);
      expect(categoriesAfterDelete.map(c => c.name)).not.toContain(testCategory);


      
    });
  });

});
