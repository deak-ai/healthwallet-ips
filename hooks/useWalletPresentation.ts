import { useState } from 'react';
import { IpsData, FlattenedResource } from '@/components/fhirIpsModels';
import { useWalletConfiguration } from '@/components/WalletConfigurationContext';
import { useIpsData } from '@/components/IpsDataContext';
import { Alert } from 'react-native';
import { UsePresentationRequest } from '@/components/waltIdWalletApi';

interface SelectedElement {
  code: string;
  label: string;
  resourceUris: string[];
}

export const useWalletPresentation = () => {
  const [loading, setLoading] = useState(false);
  const { walletApi } = useWalletConfiguration();
  const { ipsData } = useIpsData();

  const presentFromWallet = async (selectedElements: SelectedElement[], openId4VpUrl: string) => {
    try {
      if (!walletApi) {
        Alert.alert('Error', 'Please configure wallet credentials first');
        return false;
      }

      if (!ipsData) {
        Alert.alert('Error', 'No IPS data available');
        return false;
      }

      setLoading(true);

      // 1. Create a single list of FlattenedResources from all selected URIs
      const flattenedResources = selectedElements.flatMap(element => 
        ipsData.flattenedResources[element.code]?.filter(resource => 
          element.resourceUris.includes(resource.uri)
        ) || []
      );

      // 2. Extract credential IDs
      const selectedCredentials = flattenedResources
        .map(resource => resource.credentialId)
        .filter((id): id is string => id !== undefined && id !== null);

      // Get wallet ID
      const wallets = await walletApi.getWallets();
      const walletId = wallets.wallets[0].id;

      // 3. Create presentation request
      const presentationRequest: UsePresentationRequest = {
        presentationRequest: openId4VpUrl,
        selectedCredentials
      };

      // Send presentation request
      const response = await walletApi.usePresentationRequest(walletId, presentationRequest);
      console.log('Presentation request response:', response);

      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error in presentFromWallet:', error);
      Alert.alert('Error', 'Failed to create presentation');
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    presentFromWallet
  };
};
