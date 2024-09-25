export async function fetchFhirResource(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}


// Example usage
//fetchFhirResource('https://fhir.healthwallet.li/fhir/Patient/801941/_history/1?_format=json');
