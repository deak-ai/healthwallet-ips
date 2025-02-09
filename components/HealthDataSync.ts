import { IpsData, IpsSectionCode } from './fhirIpsModels';
import { VerifiableCredential } from './waltIdWalletApi';
import { decodeJwtToken } from '@/utils/jwtUtils';

export interface SyncProgress {
  current: number;
  total: number;
  progress: number;
}

export type ShareToWalletFunction = (
  ipsData: IpsData,
  code: string,
  label: string,
  selectedUris: string[],
  onProgress?: () => void
) => Promise<boolean>;

export type SharePatientFunction = (
  ipsData: IpsData
) => Promise<boolean>;

export type QueryCredentialFunction = (
  category: string,
) => Promise<VerifiableCredential[] | null>;

export class HealthDataSyncManager {
  private onProgressUpdate: (progress: SyncProgress) => void;
  private abortController: AbortController | null = null;
  private shareToWallet: ShareToWalletFunction | null = null;
  private sharePatient: SharePatientFunction | null = null;
  private queryCredentialsByCategory: QueryCredentialFunction | null = null;

  constructor(
    onProgressUpdate: (progress: SyncProgress) => void,
    shareToWallet?: ShareToWalletFunction,
    sharePatient?: SharePatientFunction,
    queryCredentialsByCategory?: QueryCredentialFunction
  ) {
    this.onProgressUpdate = onProgressUpdate;
    this.shareToWallet = shareToWallet || null;
    this.sharePatient = sharePatient || null;
    this.queryCredentialsByCategory = queryCredentialsByCategory || null;
  }

  private getTotalResources(ipsData: IpsData): number {
    // Count all resources in the resources array
    return ipsData.resources.length;
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async startSync(ipsData: IpsData): Promise<void> {
    if (!this.shareToWallet) {
      throw new Error('ShareToWallet function is required for syncing');
    }

    if (!this.sharePatient) {
      throw new Error('SharePatient function is required for syncing');
    }

    if (!this.queryCredentialsByCategory) {
      throw new Error('QueryCredentialFunction function is required for syncing');
    }

    if (this.abortController) {
      throw new Error('Sync already in progress');
    }

    this.abortController = new AbortController();
    let processedResources = 0;
    const totalResources = Object.values(ipsData.flattenedResources)
      .reduce((acc, resources) => acc + resources.length, 0);

    // First check and handle patient credential
    const patientCredentials = await this.queryCredentialsByCategory('Patient');
    if (patientCredentials && patientCredentials.length > 0) {
      // Update patient credential ID in IpsData
      ipsData.patientCredential = patientCredentials[0].id;
    } else {
      // Issue new patient credential
      const success = await this.sharePatient(ipsData);
      if (!success) {
        console.error('Failed to issue patient credential');
      }
    }

    try {
      // Keep the original loop commented for reference
      // for (const section of Object.values(IpsSectionCode)) {

      // Explicitly list all section codes for easier testing
      // Comment out sections as needed for testing
      const sections = [
        IpsSectionCode.Allergies,
        IpsSectionCode.Medications,
        IpsSectionCode.Problems,
        IpsSectionCode.Immunizations,
        IpsSectionCode.Procedures,
        // IpsSectionCode.Results,
        // IpsSectionCode.Devices
      ];

      for (const section of sections) {
        if (this.abortController.signal.aborted) {
          throw new Error('Sync aborted');
        }

        // Get all resources for this section
        const flattenedResources = ipsData.flattenedResources[section.code] || [];
      
        // Only proceed if there are resources in this section
        if (flattenedResources.length > 0) {
          // Get all URIs for this section
          let remainingUris = flattenedResources.map(r => r.uri);

          // Check for existing credentials
          const existingCredentials = await this.queryCredentialsByCategory(section.label);
          if (existingCredentials) {
            for (const credential of existingCredentials) {
              const decodedJwt = decodeJwtToken(credential.document) as any;
              const resourceUri = decodedJwt.vc.resourceId;
              
              // Find and update the matching resource
              const resource = flattenedResources.find(r => r.uri === resourceUri);
              if (resource) {
                resource.credentialId = credential.id;
                // Remove this URI from the ones we need to process
                remainingUris = remainingUris.filter(uri => uri !== resourceUri);
              }
            }
          }

          // Only call shareToWallet if we have remaining URIs to process
          if (remainingUris.length > 0) {
            await this.shareToWallet(
              ipsData,
              section.code,
              section.label,
              remainingUris,
              () => {
                processedResources++;
                this.onProgressUpdate({
                  current: processedResources,
                  total: totalResources,
                  progress: processedResources / totalResources
                });
              }
            );
          } else {
            console.log(`All resources in section ${section.label} already have credentials`);
          }
        }
      }

      // Ensure we show 100% progress at the end
      this.onProgressUpdate({
        current: totalResources,
        total: totalResources,
        progress: 1
      });
    } finally {
      this.abortController = null;
    }
  }
}
