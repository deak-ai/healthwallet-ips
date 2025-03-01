// Generic FHIR Resource Interface (Minimal, for all resources)
import {
    FhirResourceWrapper,
    FlattenedResource,
    IpsData,
    IpsSectionCode,
    IpsSectionCodeType
} from "./fhirIpsModels";


// Strategy Pattern Interface
export interface IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[];
    flatten(wrapper: FhirResourceWrapper): FlattenedResource;
}

export function filterResourceWrappers(ipsData: IpsData, sectionCode: string): FhirResourceWrapper[] {
    const section = ipsData.sections.find(section => section.code?.coding?.[0]?.code === sectionCode);
    if (!section) {
        throw new Error(`Section "${sectionCode}" not found`);
    }
    return section.entry.flatMap((entry: { reference: any; }) =>
        ipsData.resources.filter(wrapper => wrapper.fullUrl === entry.reference));
}

export class AllergyIntoleranceSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Allergies.code)
             .map(wrapper => this.flatten(wrapper));
    }

    flatten(wrapper: FhirResourceWrapper): FlattenedResource {
        return this.flattenAllergyIntolerance(wrapper)
    }

    // Flatten the allergy intolerance resource into key-value pairs
    private flattenAllergyIntolerance(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource; // The actual resource is nested within the wrapper
        const flattenedResource: FlattenedResource = {
            uri: wrapper.fullUrl,
            name: resource.code?.coding?.[0]?.display || resource.code?.text || null,
            code: resource.code?.coding?.[0]?.code || null,
            codeSystem: resource.code?.coding?.[0]?.system || null,
            criticality: resource.criticality || null,
            clinicalStatus: resource.clinicalStatus?.coding?.[0]?.code || null,
            verificationStatus: resource.verificationStatus?.coding?.[0]?.code || null,
            recordedDate: resource.recordedDate || null,
            type:resource?.type,
            category:resource?.category?.[0]
        };
        return flattenedResource;
        // Filter out keys with null values
        // return Object.fromEntries(
        //     Object.entries(flattenedResource).filter(([_, value]) => value !== null)
        // ) as FlattenedResource;
    }
}

interface DosageInstruction {
    asNeededBoolean?: boolean;
    text?: string;
    timing?: {
        repeat?: {
            frequency?: number;
            period?: number;
            periodUnit?: string;
        };
    };
    doseAndRate?: Array<{
        doseQuantity?: {
            value?: number;
        };
    }>;
    additionalInstruction?: Array<{
        text?: string;
        coding?: Array<{
            display?: string;
        }>;
    }>;
}

function formatDosageInstructions(dosageInstructions?: DosageInstruction[]): string {
    if (!dosageInstructions || dosageInstructions.length === 0) {
        return 'No dosage instructions available.';
    }

    // We'll process the first dosage instruction (most common case)
    const instruction = dosageInstructions[0];

    // Handle "as needed" case first
    if (instruction.asNeededBoolean === true) {
        return instruction.text?.endsWith('.') ? instruction.text : (instruction.text || 'Take as needed') + '.';
    }

    // Build the instruction string
    const parts: string[] = [];

    // Add any additional instructions first
    if (instruction.additionalInstruction && instruction.additionalInstruction.length > 0) {
        const additionalText = instruction.additionalInstruction[0].text || 
                             instruction.additionalInstruction[0].coding?.[0]?.display;
        if (additionalText) {
            // Remove any trailing periods as we'll add them when joining
            parts.push(additionalText.replace(/\.+$/, ''));
        }
    }

    // Add dosage quantity if available
    const doseQuantity = instruction.doseAndRate?.[0]?.doseQuantity?.value;
    const timing = instruction.timing?.repeat;

    if (doseQuantity !== undefined && timing) {
        const frequency = timing.frequency || 1;
        const period = timing.period || 1;
        const periodUnit = timing.periodUnit || 'd';

        let timingStr = '';
        if (frequency === 1 && period === 1 && periodUnit === 'd') {
            timingStr = 'once per day';
        } else if (frequency === 2 && period === 1 && periodUnit === 'd') {
            timingStr = 'twice per day';
        } else if (frequency === 3 && period === 1 && periodUnit === 'd') {
            timingStr = 'three times per day';
        } else {
            // Convert frequency to words for 1 and 2
            const frequencyWord = frequency === 1 ? 'once' :
                                frequency === 2 ? 'twice' :
                                `${frequency} times`;
            timingStr = `${frequencyWord} per ${period} ${periodUnit}`;
        }

        parts.push(`Quantity of ${doseQuantity}, ${timingStr}`);
    }

    const result = parts.join('. ');
    return result ? result + '.' : 'No specific dosage instructions available.';
}

class MedicationSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Medications.code)
            .map(wrapper => this.flatten(wrapper));
    }

    flatten(wrapper: FhirResourceWrapper): FlattenedResource {
        return this.flattenMedicationRequest(wrapper);
    }

    private flattenMedicationRequest(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource;
        const coding = resource.medicationCodeableConcept?.coding?.[0];
        const dosageInstructions = formatDosageInstructions(resource.dosageInstruction);
        
        return {
            uri: wrapper.fullUrl,
            intent: resource.intent || null,
            name: coding?.display || resource.medicationCodeableConcept?.text || null,
            code: coding?.code || null,
            codeSystem: coding?.system || null,
            status: resource.status || null,
            authoredOn: resource.authoredOn || null,
            dosageInstructions,
        };
    }
}

class ProblemSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Problems.code)
            .map(wrapper => this.flatten(wrapper));
    }

    flatten(wrapper: FhirResourceWrapper): FlattenedResource {
        return this.flattenCondition(wrapper);
    }

    private flattenCondition(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource;
        const flattenedResource: FlattenedResource = {
            uri: wrapper.fullUrl,
            name: resource.code?.coding?.[0]?.display || resource.code?.text || null,
            code: resource.code?.coding?.[0]?.code || null,
            codeSystem: resource.code?.coding?.[0]?.system || null,
            clinicalStatus: resource.clinicalStatus?.coding?.[0]?.code || null,
            verificationStatus: resource.verificationStatus?.coding?.[0]?.code || null,
            onsetDateTime: resource.onsetDateTime || null,
        };
        return flattenedResource;
    }
}

class ProcedureSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Procedures.code)
            .map(wrapper => this.flatten(wrapper));
    }

    flatten(wrapper: FhirResourceWrapper): FlattenedResource {
        return this.flattenProcedure(wrapper);
    }

    private flattenProcedure(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource;
        const flattenedResource: FlattenedResource = {
            uri: wrapper.fullUrl,
            name: resource.code?.coding?.[0]?.display || resource.code?.text || null,
            code: resource.code?.coding?.[0]?.code || null,
            codeSystem: resource.code?.coding?.[0]?.system || null,
            status: resource.status || null,
            performedStart: resource.performedPeriod?.start || null,
            performedEnd: resource.performedPeriod?.end || null,

        };
        return flattenedResource;
    }
}

class ImmunizationSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Immunizations.code)
            .map(wrapper => this.flatten(wrapper));
    }

    flatten(wrapper: FhirResourceWrapper): FlattenedResource {
        return this.flattenImmunization(wrapper);
    }

    private flattenImmunization(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource;
        const flattenedResource: FlattenedResource = {
            uri: wrapper.fullUrl,
            name: resource.vaccineCode?.coding?.[0]?.display || resource.vaccineCode?.text || null,
            code: resource.vaccineCode?.coding?.[0]?.code || null,
            codeSystem: resource.vaccineCode?.coding?.[0]?.system || null,
            status: resource.status || null,
            date: resource.occurrenceDateTime || null,
        };
        return flattenedResource;
    }
}

class ResultsSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Results.code)
            .map(wrapper => this.flatten(wrapper));
    }

    flatten(wrapper: FhirResourceWrapper): FlattenedResource {
        return this.flattenResult(wrapper);
    }

    private flattenResult(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource;
        const flattenedResource: FlattenedResource = {
            uri: wrapper.fullUrl,
            name: resource.code?.coding?.[0]?.display || resource.code?.text || null,
            code: resource.code?.coding?.[0]?.code || null,
            codeSystem: resource.code?.coding?.[0]?.system || null,
            status: resource.status || null,
            effectiveDateTime: resource.effectiveDateTime || null,
            value: resource.valueQuantity?.value || null,
            unit: resource.valueQuantity?.unit || null,
        };
        return flattenedResource;
    }
}

class MedicalDevicesSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Devices.code)
            .map(wrapper => this.flatten(wrapper));
    }

    flatten(wrapper: FhirResourceWrapper): FlattenedResource {
        return this.flattenDevice(wrapper);
    }

    private flattenDevice(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource;
        const flattenedResource: FlattenedResource = {
            uri: wrapper.fullUrl,
            name: resource.type?.coding?.[0]?.display || resource.type?.text || null,
            code: resource.type?.coding?.[0]?.code || null,
            codeSystem: resource.type?.coding?.[0]?.system || null,
            status: resource.status || null,
            manufacturer: resource.manufacturer || null,
            model: resource.model || null,
            version: resource.version || null,
        };
        return flattenedResource;
    }
}

export function getProcessor(ipsSectionCode: string): IpsSectionProcessor {
    switch (ipsSectionCode) {
        case IpsSectionCode.Allergies.code:
            return new AllergyIntoleranceSectionProcessor();
        case IpsSectionCode.Medications.code:
            return new MedicationSectionProcessor();
        case IpsSectionCode.Problems.code:
            return new ProblemSectionProcessor();
        case IpsSectionCode.Procedures.code:
            return new ProcedureSectionProcessor();
        case IpsSectionCode.Immunizations.code:
            return new ImmunizationSectionProcessor();
        case IpsSectionCode.Results.code:
            return new ResultsSectionProcessor();
        case IpsSectionCode.Devices.code:
            return new MedicalDevicesSectionProcessor();
        default:
            throw new Error(`Unknown section code: ${ipsSectionCode}`);
    }
}

export function getFlattenedIpsSections(ipsData: IpsData, sectionCodes: IpsSectionCodeType[]): { [key: string]: FlattenedResource[] } {
    const result: { [key: string]: FlattenedResource[] } = {};
    
    sectionCodes.forEach(sectionCode => {
        const processor = getProcessor(sectionCode.code);
        result[sectionCode.label] = processor.process(ipsData);
    });
    
    return result;
}
