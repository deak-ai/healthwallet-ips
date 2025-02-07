import { useState } from 'react';
import { IpsData } from '@/components/fhirIpsModels';
import { filterResourceWrappers } from '@/components/ipsResourceProcessor';
import { useWalletConfiguration } from '@/components/WalletConfigurationContext';
import { getProcessor } from '@/components/ipsResourceProcessor';
import Toast from 'react-native-toast-message';

export const useWalletShare = () => {
  const [loading, setLoading] = useState(false);
  const { smartHealthCardIssuer } = useWalletConfiguration();

  const shareToWallet = async (
    ipsData: IpsData,
    code: string,
    label: string,
    selectedUris: string[]
  ) => {
    try {
      if (!smartHealthCardIssuer) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please configure wallet credentials first',
          position: 'bottom',
        });
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

      // iterate over resourceWrappers and issue individually to wallet
      for (const { wrapper, name } of selectedResources) {
        console.log('Issuing credential for resource:', wrapper.resource.resourceType);
        const credential = await smartHealthCardIssuer.issueAndAddToWallet(
          `${label}: ${name}`,
          [wrapper]
        );
      }

      // the below issues a single credential with all resources of a single type
      // const credential = await smartHealthCardIssuer.issueAndAddToWallet(
      //   label,
      //   selectedResourceWrappers
      // );

      //console.log('Credential issued:', credential);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Credential issued successfully',
        position: 'bottom',
      });

      return true;
    } catch (error) {
      console.error('Error sharing to wallet:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to issue credential',
        position: 'bottom',
      });
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
