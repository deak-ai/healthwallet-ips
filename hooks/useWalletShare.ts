import { useState } from 'react';
import { IpsData } from '@/components/fhirIpsModels';
import { WaltIdIssuerApi } from '@/components/waltIdIssuerApi';
import { WaltIdWalletApi } from '@/components/waltIdWalletApi';
import { WaltIdSmartHealthCardIssuer } from '@/components/waltIdSmartHealthCardIssuer';
import { filterResourceWrappers } from '@/components/ipsResourceProcessor';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

export const useWalletShare = () => {
  const [loading, setLoading] = useState(false);

  const shareToWallet = async (
    ipsData: IpsData,
    code: string,
    label: string,
    selectedUris: string[]
  ) => {
    try {
      setLoading(true);
      const resourceWrappers = filterResourceWrappers(ipsData, code);
      const savedUsername = await SecureStore.getItemAsync('username');
      const savedPassword = await SecureStore.getItemAsync('password');

      if (!savedUsername || !savedPassword) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please configure wallet credentials first',
          position: 'bottom',
        });
        return false;
      }

      const issuerApi = new WaltIdIssuerApi('https://issuer.healthwallet.li');
      const walletApi = new WaltIdWalletApi(
        'https://wallet.healthwallet.li',
        savedUsername,
        savedPassword
      );

      const selectedResourceWrappers = resourceWrappers.filter(
        wrapper => selectedUris.includes(wrapper.fullUrl)
      );

      const smartHealthCardIssuer = new WaltIdSmartHealthCardIssuer(
        issuerApi,
        walletApi
      );

      console.log('Issuing credential');

      await smartHealthCardIssuer.issueAndAddToWallet(
        'Self-issued ' + label,
        ipsData.getPatientResource(),
        selectedResourceWrappers
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Data shared successfully',
        position: 'bottom',
      });

      return true;
    } catch (error) {
      // console.error('Error sharing data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share data',
        position: 'bottom',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    shareToWallet
  };
};
