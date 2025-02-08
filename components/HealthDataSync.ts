import { IpsData, FhirResourceWrapper } from './fhirIpsModels';

export interface SyncProgress {
  current: number;
  total: number;
  progress: number;
}

export class HealthDataSyncManager {
  private onProgressUpdate: (progress: SyncProgress) => void;
  private abortController: AbortController | null = null;

  constructor(onProgressUpdate: (progress: SyncProgress) => void) {
    this.onProgressUpdate = onProgressUpdate;
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
    this.abortController = new AbortController();
    const totalResources = this.getTotalResources(ipsData);
    let processedResources = 0;

    const updateProgress = () => {
      processedResources++;
      this.onProgressUpdate({
        current: processedResources,
        total: totalResources,
        progress: processedResources / totalResources
      });
    };

    try {
      // Process each resource
      for (const resource of ipsData.resources) {
        if (this.abortController.signal.aborted) {
          throw new Error('Sync aborted');
        }
        await this.processResource(resource);
        updateProgress();
      }
    } finally {
      this.abortController = null;
    }
  }

  private async processResource(resource: FhirResourceWrapper): Promise<void> {
    // Simulate processing time (remove this in production)
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 100);
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Sync aborted'));
        });
      }
    });
    
    // Here you can implement the actual sync logic for each resource
    // For example:
    // - Send to a server
    // - Store in local database
    // - Process for specific use cases
  }
}
