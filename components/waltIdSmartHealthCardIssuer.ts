import { WaltIdIssuerApi, IssuanceRequest, OnboardingResponse, OnboardingRequest, IssuanceResponse } from './waltIdIssuerApi';
import { WaltIdWalletApi, VerifiableCredential, UseOfferRequestParams, OfferRequest, CredentialRequest } from './waltIdWalletApi';
import { FhirResource, FhirResourceWrapper } from './fhirIpsModels';

/**
 * Issues SmartHealthCards to the WaltId SSI Wallet
 */
export class WaltIdSmartHealthCardIssuer {
    private issuerApi: WaltIdIssuerApi;
    private walletApi: WaltIdWalletApi;
    private onboardingResponse?: OnboardingResponse;

    constructor(issuerApi: WaltIdIssuerApi, walletApi: WaltIdWalletApi) {
        this.issuerApi = issuerApi;
        this.walletApi = walletApi;
    }

    /**
     * Onboards the issuer if not already onboarded
     * @returns Promise<OnboardingResponse>
     */
    private async ensureOnboarded(): Promise<OnboardingResponse> {
        if (!this.onboardingResponse) {
            this.onboardingResponse = await this.issuerApi.onboardIssuer();
        }
        return this.onboardingResponse;
    }

    /**
     * Creates a Smart Health Card credential request
     * @param patientResource The FHIR Patient resource
     * @param resources Additional FHIR resources to include
     * @returns Promise<IssuanceRequest>
     */
    private async createCredentialRequest(
        issuerName: string,
        resourceWrappers: FhirResourceWrapper[]
    ): Promise<IssuanceRequest> {
        const onboardingResponse = await this.ensureOnboarded();

        const fhirBundle = {
            resourceType: "Bundle",
            type: "collection",
            entry: [
                ...resourceWrappers
            ]
        };

        return {
            issuerKey: onboardingResponse.issuerKey,
            credentialConfigurationId: 'SmartHealthCard_jwt_vc_json',
            credentialData: {
                '@context': [
                    'https://www.w3.org/2018/credentials/v1'
                ],
                id: '[INSERT VC UUID]',
                resourceId: resourceWrappers[0].fullUrl,
                type: ['VerifiableCredential', 'SmartHealthCard'],
                issuer: {
                    id: '[INSERT ISSUER DID]',
                    name: issuerName,
                    url: 'https://smarthealth.cards',
                    image: 'https://en.wikipedia.org/wiki/SMART_Health_Card#/media/File:SMART_Health_IT_logo.png'
                },
                issuanceDate: '[INSERT DATE-TIME FROM WHEN THE VC IS VALID]',
                issued: '[INSERT DATE-TIME WHEN THIS VC WAS ISSUED]',
                expirationDate: '[INSERT DATE-TIME UNTIL WHEN THIS VC IS VALID]',
                credentialSubject: {
                    id: '[INSERT SUBJECT DID]',
                    fhirVersion: '4.0.1',
                    fhirBundle
                }
            },
            mapping: {
                id: '<uuid>',
                issuer: {
                    id: '<issuerDid>'
                },
                credentialSubject: {
                    id: '<subjectDid>'
                },
                issuanceDate: '<timestamp>',
                issued: "<timestamp>",
                expirationDate: '<timestamp-in:365d>'
            },
            authenticationMethod: 'PRE_AUTHORIZED' as const,
            issuerDid: onboardingResponse.issuerDid
        };
    }

    /**
     * Issues a Smart Health Card credential and adds it to the wallet
     * @param walletId The ID of the wallet to add the credential to
     * @param patientResource The FHIR Patient resource
     * @param resources Additional FHIR resources to include
     * @returns Promise<VerifiableCredential[]>
     */
    async issueAndAddToWallet(
        issuerName: string,
        resourceWrappers: FhirResourceWrapper[]
    ): Promise<VerifiableCredential[]> {

        console.log('Issuing credential')
        const credentialRequest = await this.createCredentialRequest(issuerName, resourceWrappers);
        const issuanceResponse = await this.issuerApi.issueCredential(credentialRequest);
        
        // console log the issuanceResponse.url
        console.log('Issued credential: ', issuanceResponse.url)

        console.log('Importing credential into wallet')

        // get the wallet id
        const wallets = await this.walletApi.getWallets();
        const walletId = wallets.wallets[0].id;
    
        // Get DID for the wallet
        const dids = await this.walletApi.getDids(walletId);
        const did = dids[0].did;
    
        // Use the credential offer
        const offerRequest: OfferRequest = {
            credentialOffer: issuanceResponse.url
        };
        const offerParams: UseOfferRequestParams = {
            did,
            wallet: walletId,
            requireUserInput: false
        };
        const credentials = await this.walletApi.useOfferRequest(offerRequest, offerParams);

        console.log(`Credential successfuly imported into wallet, ID: ${credentials[0].id}`);
        return credentials;
    }
}