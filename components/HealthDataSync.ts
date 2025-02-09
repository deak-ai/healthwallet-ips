import { IpsData, FhirResourceWrapper, IpsSectionCode } from './fhirIpsModels';

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

export class HealthDataSyncManager {
  private onProgressUpdate: (progress: SyncProgress) => void;
  private abortController: AbortController | null = null;
  private shareToWallet: ShareToWalletFunction | null = null;

  constructor(
    onProgressUpdate: (progress: SyncProgress) => void,
    shareToWallet?: ShareToWalletFunction
  ) {
    this.onProgressUpdate = onProgressUpdate;
    this.shareToWallet = shareToWallet || null;
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

    this.abortController = new AbortController();
    const totalResources = this.getTotalResources(ipsData);
    let processedResources = 0;

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
        // IpsSectionCode.Procedures,
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
          // Get all fullUrls for this section
          const selectedUris = flattenedResources.map(r => r.uri);

          // Share to wallet with progress tracking
          await this.shareToWallet(
            ipsData,
            section.code,
            section.label,
            selectedUris,
            () => {
              processedResources++;
              this.onProgressUpdate({
                current: processedResources,
                total: totalResources,
                progress: processedResources / totalResources
              });
            }
          );
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
