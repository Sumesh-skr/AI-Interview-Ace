// Implemented the simulateTechnicalInterview flow with question selection and resume integration.

'use server';

/**
 * @fileOverview Simulates a technical interview experience for students.
 *
 * - simulateTechnicalInterview - A function that initiates and manages the technical interview flow.
 * - SimulateTechnicalInterviewInput - The input type for the simulateTechnicalInterview function.
 * - SimulateTechnicalInterviewOutput - The return type for the simulateTechnicalInterview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TechnicalInterviewQuestionSchema = z.object({
  question: z.string().describe('The question to ask the student.'),
});

export type TechnicalInterviewQuestion = z.infer<
  typeof TechnicalInterviewQuestionSchema
>;

const SimulateTechnicalInterviewInputSchema = z.object({
  resumeText: z.string().describe('The text content of the student\'s resume.'),
  subsection: z.string().describe('The technical subsection to focus on (e.g., Full Stack, AI/ML).'),
  previousQuestion: z
    .string()
    .optional()
    .describe('The previous question asked to maintain context.'),
  previousAnswer: z
    .string()
    .optional()
    .describe('The student\'s answer to the previous question.'),
});

export type SimulateTechnicalInterviewInput = z.infer<
  typeof SimulateTechnicalInterviewInputSchema
>;

const SimulateTechnicalInterviewOutputSchema = z.object({
  question: z.string().describe('The generated technical interview question.'),
});

export type SimulateTechnicalInterviewOutput = z.infer<
  typeof SimulateTechnicalInterviewOutputSchema
>;

const getNextQuestion = ai.defineTool(
  {
    name: 'getNextQuestion',
    description: 'Retrieves the next technical interview question based on the student\'s resume, chosen subsection, previous question, and previous answer.',
    inputSchema: SimulateTechnicalInterviewInputSchema,
    outputSchema: TechnicalInterviewQuestionSchema,
  },
  async input => {
    // Logic to fetch the next question based on resume, subsection, and previous answer.
    // This is a placeholder; replace with actual implementation.
    const {resumeText, subsection, previousQuestion, previousAnswer} = input;

    // Use the resume and subsection to tailor the question.
    let promptContext = `Generate a technical interview question for a student with the following resume: ${resumeText}. Focus on the ${subsection} domain.`;

    if (previousQuestion && previousAnswer) {
      promptContext += ` The previous question was: ${previousQuestion}. The student answered: ${previousAnswer}. Ask a follow up question to check the student's understanding about the topic.`;
    }

    const nextQuestionPromptResult = await ai.generate({
      prompt: promptContext,
    });

    if (!nextQuestionPromptResult.text) {
      throw new Error('Could not generate the next question.');
    }

    return {question: nextQuestionPromptResult.text};
  }
);

const technicalInterviewPrompt = ai.definePrompt({
  name: 'technicalInterviewPrompt',
  tools: [getNextQuestion],
  prompt: `You are conducting a technical interview. Use the getNextQuestion tool to get the next question to ask the student.

  The student's resume: {{{resumeText}}}
  The interview subsection: {{{subsection}}}
  {% if previousQuestion %}The previous question: {{{previousQuestion}}}{% endif %}
  {% if previousAnswer %}The student's answer to the previous question: {{{previousAnswer}}}{% endif %}`,
});

const simulateTechnicalInterviewFlow = ai.defineFlow(
  {
    name: 'simulateTechnicalInterviewFlow',
    inputSchema: SimulateTechnicalInterviewInputSchema,
    outputSchema: SimulateTechnicalInterviewOutputSchema,
  },
  async input => {
    const {question} = await getNextQuestion(input);
    return {question};
  }
);

export async function simulateTechnicalInterview(
  input: SimulateTechnicalInterviewInput
): Promise<SimulateTechnicalInterviewOutput> {
  return simulateTechnicalInterviewFlow(input);
}
