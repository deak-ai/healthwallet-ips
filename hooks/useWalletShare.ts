import { useState } from 'react';
import { IpsData } from '@/components/fhirIpsModels';
import { filterResourceWrappers } from '@/components/ipsResourceProcessor';
import { useWalletConfiguration } from '@/components/WalletConfigurationContext';
import Toast from 'react-native-toast-message';
import { VerifiableCredential } from '@/components/waltIdWalletApi';

export const useWalletShare = () => {
  const [loading, setLoading] = useState(false);
  const { smartHealthCardIssuer, walletApi } = useWalletConfiguration();

  const queryCredentialsByCategory = async (category: string): Promise<VerifiableCredential[] | null> => {
    try {
      if (!walletApi) {
        //show error toast
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please configure wallet credentials first',
          position: 'bottom',
        });
        return null;
      }
      setLoading(true);
      const wallets = await walletApi.getWallets();
      const walletId = wallets.wallets[0].id;
      const credentials = await walletApi.queryCredentials({
        category: [category],
        id: walletId,
        sortBy: 'addedOn',
        showPending: false,
        showDeleted: false,
      });
      return credentials;
    } catch (error) {
      console.log('Failed to query credentials:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to query credential',
        position: 'bottom',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }

  const shareToWallet = async (
    ipsData: IpsData,
    code: string,
    label: string,
    selectedUris: string[],
    onProgress?: () => void
  ): Promise<boolean> => {
    try {
      if (!smartHealthCardIssuer || !walletApi) {
        if (!onProgress) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Please configure wallet credentials first',
            position: 'bottom',
          });
        }
        return false;
      }

      setLoading(true);
      const resourceWrappers = filterResourceWrappers(ipsData, code);

      const selectedResources = resourceWrappers
        .filter(wrapper => selectedUris.includes(wrapper.fullUrl))
        .map(wrapper => ({
          wrapper,
          flattenedResource: ipsData.flattenedResources[code].find(r => r.uri === wrapper.fullUrl)!
        }));

      // get the wallet id
      const wallets = await walletApi.getWallets();
      const walletId = wallets.wallets[0].id;

      // iterate over resourceWrappers and issue individually to wallet
      for (let i = 0; i < selectedResources.length; i++) {
        const { wrapper, flattenedResource } = selectedResources[i];
        
        console.log('Issuing credential for resource:', wrapper.resource.resourceType);
        const credentials = await smartHealthCardIssuer.issueAndAddToWallet(
          `${label}: ${flattenedResource.name}`,
          [wrapper]
        );

        // Update the credentialId in the flattened resource
        if (credentials && credentials.length > 0) {
          flattenedResource.credentialId = credentials[0].id;
        }

        // make sure to tag the new credential
        try {
          // await walletApi.addCategory(walletId, wrapper.fullUrl)
          // await walletApi.attachCategories(walletId, credentials[0].id,[wrapper.fullUrl,'SmartHealthCard',label])
          await walletApi.attachCategories(walletId, credentials[0].id,['SmartHealthCard',label])
        } catch (error) {
          console.log("Failed to attach category to credential:", error);
        }

        // Update progress if callback is provided
        if (onProgress) {
          onProgress();
        }
      }

      if (!onProgress) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Credential issued successfully',
          position: 'bottom',
        });
      }

      return true;
    } catch (error) {
      console.error('Error sharing to wallet:', error);
      if (!onProgress) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to issue credential',
          position: 'bottom',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    shareToWallet,
    queryCredentialsByCategory
  };
};
