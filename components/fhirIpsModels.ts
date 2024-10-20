
export interface IpsData {
    sectionResource: FhirResource;
    sections: any[];
    resources: FhirResource[];
}

export interface FhirResourceWrapper {
    fullUrl: string;
    resource: FhirResource; // The actual FHIR resource, which will be processed specifically
}

export interface FhirResource {
    resourceType: string;
    // Any additional common fields can be added here if needed
    [key: string]: any; // Allows for any other properties that are resource-specific
}

export interface FlattenedResource {
    uri: string;
    name: string;
    [key: string]: string | number | boolean | null; // Key-value pairs for easy table rendering
}

export const IpsSectionCode = {
    Allergies: { code: '48765-2', label: 'Allergies' },
    Medications: { code: '10160-0', label: 'Medications' },
    Problems: { code: '11450-4', label: 'Problems' },
    Procedures: { code: '47519-4', label: 'Procedures' },
    Immunizations: { code: '11369-6', label: 'Immunizations' },
    Results: { code: '30954-2', label: 'Results' },
    Devices: { code: '46264-8', label: 'Devices' },
} as const;

export type IpsSectionCodeType = typeof IpsSectionCode[keyof typeof IpsSectionCode];

export type IpsSectionCodeKey = keyof typeof IpsSectionCode;
