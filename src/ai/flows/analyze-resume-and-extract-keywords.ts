'use server';

/**
 * @fileOverview Analyzes a resume to extract keywords, generate a strength chart, and create a summary table.
 *
 * - analyzeResumeAndExtractKeywords - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResumeAndExtractKeywords function.
 * - AnalyzeResumeOutput - The return type for the analyzeResumeAndextractKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const SummaryCategorySchema = z.object({
  score: z.number().min(0).max(100).describe('A score from 0-100 representing the strength of this category based on the resume.'),
  keywords: z.array(z.string()).describe('A list of keywords found in the resume related to this category.'),
});

const AnalyzeResumeOutputInternalSchema = z.object({
  name: z.string().describe("The full name of the candidate extracted from the resume."),
  keywords: z.array(z.string()).describe('A list of general, relevant keywords extracted from the resume.'),
  summary: z.object({
    softwareTech: SummaryCategorySchema,
    hardwareTech: SummaryCategorySchema,
    softSkills: SummaryCategorySchema,
    leadership: SummaryCategorySchema,
    experience: SummaryCategorySchema,
    academics: SummaryCategorySchema,
  }).describe('A structured summary of different categories based on the resume analysis.'),
});

const AnalyzeResumeOutputSchema = AnalyzeResumeOutputInternalSchema.extend({
  overallAtsScore: z.number().min(0).max(100).describe('An overall ATS-friendliness score from 0-100 for the resume, based on formatting, keywords, and clarity.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;


export async function analyzeResumeAndExtractKeywords(
  input: AnalyzeResumeInput
): Promise<AnalyzeResumeOutput> {
  return analyzeResumeAndExtractKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumeAndExtractKeywordsPrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputInternalSchema},
  prompt: `You are an expert AI resume analyzer with deep knowledge of Applicant Tracking Systems (ATS). Your task is to analyze the provided resume and perform the following actions:
1.  Extract the full name of the candidate.
2.  Extract a list of general keywords that highlight the candidate's skills and experience.
3.  Generate a structured summary for the following categories: 'softwareTech', 'hardwareTech', 'softSkills', 'leadership', 'experience', and 'academics'.
4.  For each category in the summary, provide a strength score from 0 to 100 based on the entire resume, and list the specific keywords or phrases from the resume that justify the score.

Analyze the following resume:
{{media url=resumeDataUri}}

Provide the output in the specified JSON format. The scores should be a realistic assessment. If a category is not present, give it a score of 0 and an empty keywords list.
`,
});

const analyzeResumeAndExtractKeywordsFlow = ai.defineFlow(
  {
    name: 'analyzeResumeAndExtractKeywordsFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to get analysis from AI");
    }

    const { summary } = output;

    // Define weights for each category to calculate a weighted average for the ATS score.
    const weights = {
      experience: 0.25,
      softwareTech: 0.25,
      softSkills: 0.15,
      academics: 0.15,
      leadership: 0.1,
      hardwareTech: 0.1,
    };

    const weightedScore = Object.entries(summary).reduce((acc, [key, value]) => {
      const category = key as keyof typeof weights;
      if (weights[category]) {
        return acc + value.score * weights[category];
      }
      return acc;
    }, 0);
    
    // A base score can be added to account for general resume formatting and clarity, not covered by categories.
    const baseFormattingScore = 10;
    const overallAtsScore = Math.min(100, Math.round(weightedScore + baseFormattingScore));

    return {
      ...output,
      overallAtsScore,
    };
  }
);
