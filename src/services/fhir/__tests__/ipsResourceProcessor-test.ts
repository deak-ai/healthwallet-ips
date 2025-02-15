import {AllergyIntoleranceSectionProcessor, getProcessor, getFlattenedIpsSections}
    from '../ipsResourceProcessor';
import {FhirUrlStreamProcessor} from "@/services/fhir/fhirStreamProcessorUrl";
import {IpsData, IpsSectionCode, FlattenedResource} from "@/services/fhir/fhirIpsModels";
import yaml from 'js-yaml';

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
        category: 'food',
        uri: 'urn:uuid:89080431-a2ad-43ce-af79-a97e7081829f',
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
        uri: 'urn:uuid:f1421eda-ef95-4ec1-ae00-041486d0b68d',
        name: 'Shellfish allergy',
        code: '300913006',
        codeSystem: 'http://snomed.info/sct',
        criticality: 'low',
        clinicalStatus: 'active',
        verificationStatus: 'confirmed',
        recordedDate: '1953-03-04T10:53:57+01:00',
        type: 'allergy',
        category: 'food'
    };
    expect(result[1]).toEqual(expectedFlattenedResource);

});

test('Should process medications with "as needed" dosage instructions - Patient 801941', async () => {
    const ipsData = await loadPatient('801941');
    const medications = getProcessor(IpsSectionCode.Medications.code).process(ipsData);
    
    expect(medications).toHaveLength(3);
    const asNeededMed = medications.find(med => typeof med.dosageInstructions === 'string' && med.dosageInstructions.includes('Take as needed'));
    expect(asNeededMed).toBeTruthy();
    expect(asNeededMed?.name).toBeTruthy();

    console.log(JSON.stringify(medications, null, 2));
});

test('Should handle patient with no medications - Patient 803331', async () => {
    const ipsData = await loadPatient('803331');
    const medications = getProcessor(IpsSectionCode.Medications.code).process(ipsData);
    console.log(JSON.stringify(medications, null, 2));
    expect(medications).toHaveLength(1);
    expect(medications[0].dosageInstructions).toBe('No dosage instructions available.');
});

test('Should handle medications without dosage instructions - Patient 803565', async () => {
    const ipsData = await loadPatient('803565');
    const medications = getProcessor(IpsSectionCode.Medications.code).process(ipsData);
    
    expect(medications).toHaveLength(2);
    medications.forEach(med => {
        expect(med.dosageInstructions).toBe('No dosage instructions available.');
    });
});

test('Should process medications with mixed dosage instructions - Patient 1076859', async () => {
    const ipsData = await loadPatient('1076859');
    const medications = getProcessor(IpsSectionCode.Medications.code).process(ipsData);
    
    expect(medications).toHaveLength(2);
    
    // Find the "as needed" medication
    const asNeededMed = medications.find(med => typeof med.dosageInstructions === 'string' && med.dosageInstructions.includes('Take as needed'));
    expect(asNeededMed).toBeTruthy();
    
    // Find the medication with additional instructions
    const scheduledMed = medications.find(med => 
        typeof med.dosageInstructions === 'string' && med.dosageInstructions.includes('Take at regular intervals') && 
        typeof med.dosageInstructions === 'string' && med.dosageInstructions.includes('Complete the prescribed course')
    );
    expect(scheduledMed).toBeTruthy();

    console.log(JSON.stringify(medications, null, 2));
});

test('Should process medications with various dosage patterns - Patient 1535983', async () => {
    const ipsData = await loadPatient('1535983');
    const medications = getProcessor(IpsSectionCode.Medications.code).process(ipsData);
    
    expect(medications).toHaveLength(10);
    
    // Count medications with different dosage patterns
    const dosagePatterns = {
        asNeeded: 0,
        oncePerDay: 0,
        twicePerDay: 0,
        threeTimesPerDay: 0,
        other: 0,
        noDosage: 0
    };
    
    medications.forEach(med => {
        const instructions = med.dosageInstructions || '';
        if (typeof instructions === 'string' && instructions.includes('Take as needed')) {
            dosagePatterns.asNeeded++;
        } else if (typeof instructions === 'string' && instructions.includes('once per day')) {
            dosagePatterns.oncePerDay++;
        } else if (typeof instructions === 'string' && instructions.includes('twice per day')) {
            dosagePatterns.twicePerDay++;
        } else if (typeof instructions === 'string' && instructions.includes('three times per day')) {
            dosagePatterns.threeTimesPerDay++;
        } else if (instructions === 'No dosage instructions available.') {
            dosagePatterns.noDosage++;
        } else if (typeof instructions === 'string' && instructions.includes(',')) {
            dosagePatterns.other++;
        }
    });
    
    // Ensure we have a mix of different dosage patterns
    expect(dosagePatterns.asNeeded + dosagePatterns.oncePerDay + 
           dosagePatterns.twicePerDay + dosagePatterns.threeTimesPerDay + 
           dosagePatterns.other + dosagePatterns.noDosage).toBe(10);
           
    // Log the patterns for visibility
    console.log('Dosage patterns found:', dosagePatterns);
    console.log(JSON.stringify(medications, null, 2));
});

test('Should correctly convert relevant sections to yaml for patient 803331', async () => {

    const ipsData = await loadPatient('803331');


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

test('Should correctly convert relevant sections to yaml for patient 1535983', async () => {

    const ipsData = await loadPatient('1535983');

    getProcessor(IpsSectionCode.Medications.code).process(ipsData)
        .forEach(r => console.log(yaml.dump(r))  );


})

test('Should correctly handle medications with custom dosage instructions - Patient 1080509', async () => {
    const ipsData = await loadPatient('1080509');
    
    const medications = getProcessor(IpsSectionCode.Medications.code).process(ipsData);
    
    expect(medications).toHaveLength(7);

    // Find medications with custom dosage instructions
    const customDosageMeds = medications.filter(med => 
        med.dosageInstructions !== 'No dosage instructions available.' &&
        med.dosageInstructions !== 'Take as needed.'
    );
    
    expect(customDosageMeds).toHaveLength(2);
    
    // Verify specific dosage instructions
    const dosageInstructions = customDosageMeds.map(med => med.dosageInstructions).sort();
    expect(dosageInstructions[0]).toBe('Quantity of 1, once per day.');
    expect(dosageInstructions[1]).toBe('Quantity of 4, once per 4 h.');

    console.log(JSON.stringify(medications, null, 2));

});

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
