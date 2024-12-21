import { generateSummary } from '../AxAIFhirpathGenerator';

describe('AxAIFhirpathGenerator', () => {
  it('should generate a summary', async () => {
    const result = await generateSummary('Does the patient have a shellfish allergy?');
    console.log('Generated summary:', result);
    expect(result).toBeDefined();
  });
});
