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
            type: resource.type || null,
            name: resource.code?.coding?.[0]?.display || resource.code?.text || null,
            //code: resource.code?.coding?.[0]?.code || null,
            //codeSystem: resource.code?.coding?.[0]?.system || null,
            criticality: resource.criticality || null,
            clinicalStatus: resource.clinicalStatus?.coding?.[0]?.code || null,
            verificationStatus: resource.verificationStatus?.coding?.[0]?.code || null,
            //recordedDate: resource.recordedDate || null,
        };
        // Filter out keys with null values
        return Object.fromEntries(
            Object.entries(flattenedResource).filter(([_, value]) => value !== null)
        ) as FlattenedResource;
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
            //intent: resource.intent || null,
            name: resource.medicationCodeableConcept?.coding?.[0]?.display || resource.medicationCodeableConcept?.text || null,
            //code: resource.medicationCodeableConcept?.coding?.[0]?.code || null,
            //codeSystem: resource.medicationCodeableConcept?.coding?.[0]?.system || null,
            status: resource.status || null,
            //authoredOn: resource.authoredOn || null,
        };

        // Filter out keys with null values
        return Object.fromEntries(
            Object.entries(flattenedResource).filter(([_, value]) => value !== null)
        ) as FlattenedResource;
    }
}



export function getProcessor(ipsSectionCode: string): IpsSectionProcessor {
    switch (ipsSectionCode) {
        case IpsSectionCode.Allergies.code:
            return new AllergyIntoleranceSectionProcessor();
        case IpsSectionCode.Medications.code:
            return new MedicationSectionProcessor();
        // case "Condition":
        //     return new ConditionResourceProcessor();
        // case "Immunization":
        //     return new ImmunizationResourceProcessor();
        // case "Procedure":
        //     return new ProcedureResourceProcessor();
        // case "Observation": // For results
        //     return new ObservationResourceProcessor();
        // case "DiagnosticReport":
        //     return new DiagnosticReportResourceProcessor();
        default:
            throw new Error(`Unknown section code: ${ipsSectionCode}`);
    }
}


