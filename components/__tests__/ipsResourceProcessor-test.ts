import {AllergyIntoleranceSectionProcessor, getProcessor, getFlattenedIpsSections}
    from '../ipsResourceProcessor';
import {FhirUrlStreamProcessor} from "@/components/fhirStreamProcessorUrl";
import {IpsData, IpsSectionCode} from "@/components/fhirIpsModels";
import yaml from 'js-yaml';
import {FlattenedResource} from "@/components/fhirIpsModels";


async function loadPatient(patientId: string): Promise<IpsData> {
    const ipsUrl = `https://fhir-static.healthwallet.li/fhir-examples/ips-fhir/${patientId}-ips.json`;
    //const ipsUrl = `http://localhost:8800/fhir-examples/ips-fhir/${patientId}-ips.json`
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
        uri: 'urn:uuid:89080431-a2ad-43ce-af79-a97e7081829f',
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
        uri: 'urn:uuid:f1421eda-ef95-4ec1-ae00-041486d0b68d',
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

test('getFlattenedResourcesMap should return a map of sections to their flattened resources', async () => {
    const ipsData = await loadPatient('801941');
    const resourceMap = getFlattenedIpsSections(ipsData, [
        IpsSectionCode.Allergies,
        IpsSectionCode.Medications,
        IpsSectionCode.Problems
    ]);
    
    console.log(JSON.stringify(resourceMap, null, 2));
    
    // Check that we have the expected sections
    expect(Object.keys(resourceMap)).toContain(IpsSectionCode.Allergies.label);
    expect(Object.keys(resourceMap)).toContain(IpsSectionCode.Medications.label);
    expect(Object.keys(resourceMap)).toContain(IpsSectionCode.Problems.label);
    
    // Check that each section has resources
    expect(resourceMap[IpsSectionCode.Allergies.label].length).toBeGreaterThan(0);
    expect(resourceMap[IpsSectionCode.Medications.label].length).toBeGreaterThan(0);
    expect(resourceMap[IpsSectionCode.Problems.label].length).toBeGreaterThan(0);
    
});
