import { AxAI, AxGen } from '@ax-llm/ax';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from project root and log the resolved path
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });


if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set. Please check your .env file in the project root.');
}

const prompt = new AxGen(
    `"Generate a FHIRPath query expression for a question on a patients personal health record (PHR) expressed in an Internation Patient Summary (IPS) FHIR Document" question -> fhirpath`)


prompt.setExamples([
    {
        question: "What are all the patient's allergies?",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance).code.coding.display",
    },
    {
        question: "What are the severity levels of allergies?",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance).reaction.severity",
    },
    {
        question: "Are there any critical or high-risk allergies?",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance and criticality = 'high').code.coding.display",
    },
    {
        question: "What is the clinical status of allergies?",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance).clinicalStatus.coding.code",
    },
    {
        question: "Does the patient have any food allergies?",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance and category = 'food').code.coding.display",
    },
    {
        question: "Does the patient have any environmental allergies?",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance and category = 'environment').code.coding.display",
    },
    {
        question: "Does the patient have any medication allergies?",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance and category = 'medication').code.coding.display",
    },
    {
        question: "Does the patient have hayfever? (text)",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance and code.text.contains('pollen')).exitst().exists()",
    },
    {
        question: "Does the patient have hayfever? (coding where)",
        fhirpath: "Bundle.entry.resource.where($this is AllergyIntolerance and code.coding.where(display.lower().contains('pollen')).exists()).exists()",
    },
    {
        question: "What medications is the patient currently taking?",
        fhirpath: "Bundle.entry.resource.where($this is MedicationStatement or $this is MedicationRequest).where(status = 'active').select(iif($this is MedicationStatement, medication.display, medicationCodeableConcept.coding.display))",
    },
    {
        question: "What are the medication dosage instructions?",
        fhirpath: "Bundle.entry.resource.where($this is MedicationStatement or $this is MedicationRequest).dosage.text",
    },
    {
        question: "What routes are used for medication administration?",
        fhirpath: "Bundle.entry.resource.where($this is MedicationStatement or $this is MedicationRequest).dosage.route.coding.display",
    },
    {
        question: "What are the patient's current active problems or conditions?",
        fhirpath: "Bundle.entry.resource.where($this is Condition and clinicalStatus.coding.code = 'active').code.coding.display",
    },
    {
        question: "What is the severity of conditions?",
        fhirpath: "Bundle.entry.resource.where($this is Condition).severity.coding.display",
    },
    {
        question: "What is the clinical status of each condition?",
        fhirpath: "Bundle.entry.resource.where($this is Condition).clinicalStatus.coding.code",
    },
    {
        question: "What procedures has the patient undergone?",
        fhirpath: "Bundle.entry.resource.where($this is Procedure).code.coding.display",
    },
    {
        question: "When were the procedures performed?",
        fhirpath: "Bundle.entry.resource.where($this is Procedure).performedDateTime",
    },
    {
        question: "What is the status of each procedure?",
        fhirpath: "Bundle.entry.resource.where($this is Procedure).status",
    },
    {
        question: "What vaccinations has the patient received?",
        fhirpath: "Bundle.entry.resource.where($this is Immunization).vaccineCode.coding.display",
    },
    {
        question: "When were the vaccinations given?",
        fhirpath: "Bundle.entry.resource.where($this is Immunization).occurrenceDateTime",
    },
    {
        question: "What is the status of each vaccination?",
        fhirpath: "Bundle.entry.resource.where($this is Immunization).status",
    },
    {
        question: "What laboratory tests have been performed?",
        fhirpath: "Bundle.entry.resource.where($this is Observation and category.coding.code = 'laboratory').code.coding.display",
    },
    {
        question: "What are the values of laboratory results?",
        fhirpath: "Bundle.entry.resource.where($this is Observation and category.coding.code = 'laboratory').value.quantity",
    },
    {
        question: "When were the laboratory tests performed?",
        fhirpath: "Bundle.entry.resource.where($this is Observation and category.coding.code = 'laboratory').effectiveDateTime",
    }
])


const ai = new AxAI({
  name: 'openai',
  apiKey: process.env.OPENAI_API_KEY
});



export async function generateSummary(question: string) {
  try {
    const res = await prompt.forward(ai, { question });
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

