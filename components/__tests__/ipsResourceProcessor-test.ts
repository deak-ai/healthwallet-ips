import {AllergyIntoleranceSectionProcessor, filterResourceWrappers, getProcessor}
    from '../ipsResourceProcessor';
import {FhirUrlStreamProcessor} from "@/components/fhirStreamProcessorUrl";
import {IpsData, IpsSectionCode} from "@/components/fhirIpsModels";
import yaml from 'js-yaml';


interface FhirResource {
    resourceType: string;
    id: string;
    [key: string]: any;
}

interface FlattenedResource {
    [key: string]: string | number | boolean | null;
}


async function loadPatient(patientId: string): Promise<IpsData> {
    const ipsUrl = `http://localhost:8800/fhir-examples/ips-fhir/${patientId}-ips.json`
    const sectionProcessor = new FhirUrlStreamProcessor()
    return await sectionProcessor.streamData(ipsUrl);
}

test('Should correctly list of AllergyIntolerance resource with all fields populated', async () => {
    const processor = new AllergyIntoleranceSectionProcessor();

    const ipsData = await loadPatient('801941');

    const result = processor.process(ipsData);

    expect(result).toHaveLength(2);

    // Expect the first element to have all fields populated
    let expectedFlattenedResource: FlattenedResource = {
        type: 'allergy',
        name: 'Allergy to grass pollen',
        code: '418689008',
        codeSystem: 'http://snomed.info/sct',
        criticality: 'low',
        clinicalStatus: 'active',
        verificationStatus: 'confirmed',
        recordedDate: '1953-03-04T10:53:57+01:00'
    };
    expect(result[0]).toEqual(expectedFlattenedResource);

    expectedFlattenedResource = {
        type: 'allergy',
        name: 'Shellfish allergy',
        code: '300913006',
        codeSystem: 'http://snomed.info/sct',
        criticality: 'low',
        clinicalStatus: 'active',
        verificationStatus: 'confirmed',
        recordedDate: '1953-03-04T10:53:57+01:00'
    };
    expect(result[1]).toEqual(expectedFlattenedResource);

});


test('Should correctly convert relevant sections to yaml for patient 801941', async () => {

    const ipsData = await loadPatient('801941');

    getProcessor(IpsSectionCode.Allergies.code).process(ipsData)
        .forEach(r => console.log(yaml.dump(r))  );

    getProcessor(IpsSectionCode.Medications.code).process(ipsData)
        .forEach(r => console.log(yaml.dump(r))  );

})

test('Should correctly convert relevant sections to yaml for patient 803565', async () => {

    const ipsData = await loadPatient('803565');

    getProcessor(IpsSectionCode.Allergies.code).process(ipsData)
        .forEach(r => console.log(yaml.dump(r))  );

    getProcessor(IpsSectionCode.Medications.code).process(ipsData)
        .forEach(r => console.log(yaml.dump(r))  );

})