import {AllergyIntoleranceSectionProcessor, getProcessor, getFlattenedIpsSections, filterResourceWrappers}
    from '../ipsResourceProcessor';
import {FhirUrlStreamProcessor} from "@/components/fhirStreamProcessorUrl";
import {IpsData, IpsSectionCode} from "@/components/fhirIpsModels";
import {WaltIdIssuerApi} from "@/components/waltIdIssuerApi";
import {WaltIdWalletApi, OfferRequest, CredentialRequest, UseOfferRequestParams} from "@/components/waltIdWalletApi";
import yaml from 'js-yaml';
import { WaltIdSmartHealthCardIssuer } from '../waltIdSmartHealthCardIssuer';



async function loadPatient(patientId: string): Promise<IpsData> {
    const ipsUrl = `https://fhir-static.healthwallet.li/fhir-examples/ips-fhir/${patientId}-ips.json`;
    //const ipsUrl = `http://localhost:8800/fhir-examples/ips-fhir/${patientId}-ips.json`
    const sectionProcessor = new FhirUrlStreamProcessor()
    return await sectionProcessor.streamData(ipsUrl);
}

function getPatientResource(ipsData: IpsData) {
    return ipsData.resources[0]
}


test('Should correctly issue SmartHealthCard credential', async () => {
        const ipsData = await loadPatient('801941');
        const ipsSection = IpsSectionCode.Allergies;
        const resourceWrappers = filterResourceWrappers(ipsData, ipsSection.code);
        const patientResourceWrapper = getPatientResource(ipsData);
        expect(patientResourceWrapper.resource.resourceType).toBe('Patient');

        const issuerApi = new WaltIdIssuerApi('https://issuer.healthwallet.li');
        const walletApi = new WaltIdWalletApi('https://wallet.healthwallet.li', 'user@email.com', 'password');

        const smartHealthCardIssuer = new WaltIdSmartHealthCardIssuer(issuerApi, walletApi);

        const vc = await smartHealthCardIssuer.issueAndAddToWallet('Self-issued '+ipsSection.label, patientResourceWrapper, resourceWrappers);

       expect(vc[0].id).toBeDefined(); 
       
}, 30000);


