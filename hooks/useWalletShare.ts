import { useState } from 'react';
import { IpsData } from '@/components/fhirIpsModels';
import { filterResourceWrappers } from '@/components/ipsResourceProcessor';
import { useWalletConfiguration } from '@/components/WalletConfigurationContext';
import { getProcessor } from '@/components/ipsResourceProcessor';
import Toast from 'react-native-toast-message';

export const useWalletShare = () => {
  const [loading, setLoading] = useState(false);
  const { smartHealthCardIssuer, walletApi } = useWalletConfiguration();

  // Keep track of total processed resources across all sections
  let totalProcessed = 0;

  const shareToWallet = async (
    ipsData: IpsData,
    code: string,
    label: string,
    selectedUris: string[],
    onProgress?: () => void
  ) => {
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
          name: getProcessor(code).flatten(wrapper).name
        }));

      // get the wallet id
      const wallets = await walletApi.getWallets();
      const walletId = wallets.wallets[0].id;

      // iterate over resourceWrappers and issue individually to wallet
      for (let i = 0; i < selectedResources.length; i++) {
        const { wrapper, name } = selectedResources[i];
        
        console.log('Issuing credential for resource:', wrapper.resource.resourceType);
        const credentials = await smartHealthCardIssuer.issueAndAddToWallet(
          `${label}: ${name}`,
          [wrapper]
        );

        // make sure to tag the new credential
        try {
          // await walletApi.addCategory(walletId, wrapper.fullUrl)
          // await walletApi.attachCategories(walletId, credentials[0].id,[wrapper.fullUrl,'SmartHealthCard',label])
          //await walletApi.attachCategories(walletId, credentials[0].id,['SmartHealthCard',label])
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
  };
};
