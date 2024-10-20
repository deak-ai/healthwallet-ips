// Generic FHIR Resource Interface (Minimal, for all resources)
import {
    FhirResourceWrapper,
    FlattenedResource,
    IpsData,
    IpsSectionCode,
    IpsSectionCodeKey, IpsSectionCodeType
} from "@/components/fhirIpsModels";


// Strategy Pattern Interface
export interface IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[];
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
             .map(wrapper => this.flattenAllergyIntolerance(wrapper));
    }

    // Flatten the allergy intolerance resource into key-value pairs
    private flattenAllergyIntolerance(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource; // The actual resource is nested within the wrapper
        const flattenedResource: FlattenedResource = {
            uri: wrapper.fullUrl,
            type: resource.type || null,
            name: resource.code?.coding?.[0]?.display || resource.code?.text || null,
            code: resource.code?.coding?.[0]?.code || null,
            codeSystem: resource.code?.coding?.[0]?.system || null,
            criticality: resource.criticality || null,
            clinicalStatus: resource.clinicalStatus?.coding?.[0]?.code || null,
            verificationStatus: resource.verificationStatus?.coding?.[0]?.code || null,
            recordedDate: resource.recordedDate || null,
        };
        return flattenedResource;
        // Filter out keys with null values
        // return Object.fromEntries(
        //     Object.entries(flattenedResource).filter(([_, value]) => value !== null)
        // ) as FlattenedResource;
    }
}

class MedicationSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Medications.code)
            .map(wrapper => this.flattenMedicationRequest(wrapper));
    }

    private flattenMedicationRequest(wrapper: FhirResourceWrapper): FlattenedResource {
        const resource = wrapper.resource;
        const flattenedResource: FlattenedResource = {
            uri: wrapper.fullUrl,
            intent: resource.intent || null,
            name: resource.medicationCodeableConcept?.coding?.[0]?.display || resource.medicationCodeableConcept?.text || null,
            code: resource.medicationCodeableConcept?.coding?.[0]?.code || null,
            codeSystem: resource.medicationCodeableConcept?.coding?.[0]?.system || null,
            status: resource.status || null,
            authoredOn: resource.authoredOn || null,
        };
        return flattenedResource;
    }
}

class ProblemSectionProcessor implements IpsSectionProcessor {
    process(ipsData: IpsData): FlattenedResource[] {
        return filterResourceWrappers(ipsData, IpsSectionCode.Problems.code)
            .map(wrapper => this.flattenCondition(wrapper));
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
            .map(wrapper => this.flattenProcedure(wrapper));
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
            .map(wrapper => this.flattenImmunization(wrapper));
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
            .map(wrapper => this.flattenResult(wrapper));
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
            .map(wrapper => this.flattenDevice(wrapper));
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

