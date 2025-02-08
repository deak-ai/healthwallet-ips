import { filterResourceWrappers}
    from '../ipsResourceProcessor';
import {FhirUrlStreamProcessor} from "@/components/fhirStreamProcessorUrl";
import {IpsData, IpsSectionCode} from "@/components/fhirIpsModels";
import {WaltIdIssuerApi} from "@/components/waltIdIssuerApi";
import {WaltIdWalletApi} from "@/components/waltIdWalletApi";
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
        const ipsSection = IpsSectionCode.Medications;
        const resourceWrappers = filterResourceWrappers(ipsData, ipsSection.code);
        // const patientResourceWrapper = getPatientResource(ipsData);
        // expect(patientResourceWrapper.resource.resourceType).toBe('Patient');

        // Add patient resource as the first item in the array
        // console.log('Before unshift:', resourceWrappers.map(w => w.resource.resourceType));
        // resourceWrappers.unshift(patientResourceWrapper);
        // console.log('After unshift:', resourceWrappers.map(w => w.resource.resourceType));

        const issuerApi = new WaltIdIssuerApi('https://issuer.healthwallet.li');
        const walletApi = new WaltIdWalletApi('https://wallet.healthwallet.li', 'user@email.com', 'password');

        const smartHealthCardIssuer = new WaltIdSmartHealthCardIssuer(issuerApi, walletApi);

        const vc = await smartHealthCardIssuer.issueAndAddToWallet('Self-issued '+ipsSection.label, [resourceWrappers[1]]);

       expect(vc[0].id).toBeDefined(); 
       
}, 30000);
