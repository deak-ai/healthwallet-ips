import { useState } from 'react';
import { IpsData } from '@/components/fhirIpsModels';
import { useWalletConfiguration } from '@/components/WalletConfigurationContext';
import { useIpsData } from '@/components/IpsDataContext';
import { Alert } from 'react-native';

interface SelectedElement {
  code: string;
  label: string;
  resourceUris: string[];
}

export const useWalletPresentation = () => {
  const [loading, setLoading] = useState(false);
  const { walletApi } = useWalletConfiguration();
  const { ipsData } = useIpsData();

  const presentFromWallet = async (selectedElements: SelectedElement[]) => {
    try {
      if (!walletApi) {
        Alert.alert(
          'Error',
          'Please configure wallet credentials first'
        );
        return false;
      }

      if (!ipsData) {
        Alert.alert(
          'Error',
          'No IPS data available'
        );
        return false;
      }

      setLoading(true);

      // For now, just show the selected elements in an alert
      Alert.alert(
        'Selected Resources',
        JSON.stringify(selectedElements, null, 2)
      );

      // TODO: Implement actual OpenID4VP presentation logic here
      // 1. Get wallet ID
      // 2. Process selected resources using ipsData
      // 3. Create presentation
      // 4. Send to verifier

      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error in presentFromWallet:', error);
      Alert.alert(
        'Error',
        'Failed to create presentation'
      );
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    presentFromWallet
  };
};
