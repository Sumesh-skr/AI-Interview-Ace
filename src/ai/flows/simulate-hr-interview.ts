'use server';

/**
 * @fileOverview A flow to simulate an HR interview based on a candidate's resume.
 *
 * - simulateHrInterview - A function that initiates the HR interview simulation.
 * - SimulateHrInterviewInput - The input type for the simulateHrInterview function, which includes the candidate's resume and the previous answer.
 * - SimulateHrInterviewOutput - The return type for the simulateHrInterview function, providing the next question and interview state.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateHrInterviewInputSchema = z.object({
  resume: z
    .string()
    .describe('The candidate\'s resume as a text string.'),
  previousAnswer: z
    .string()
    .optional()
    .describe('The candidate\'s answer to the previous question.'),
  interviewState: z
    .string()
    .optional()
    .describe('The current state of the interview as a JSON string.'),
});
export type SimulateHrInterviewInput = z.infer<
  typeof SimulateHrInterviewInputSchema
>;

const SimulateHrInterviewOutputSchema = z.object({
  nextQuestion: z.string().describe('The next question to ask the candidate.'),
  interviewState: z
    .string()
    .describe('The updated state of the interview as a JSON string.'),
});
export type SimulateHrInterviewOutput = z.infer<
  typeof SimulateHrInterviewOutputSchema
>;

export async function simulateHrInterview(
  input: SimulateHrInterviewInput
): Promise<SimulateHrInterviewOutput> {
  return simulateHrInterviewFlow(input);
}

const hrInterviewPrompt = ai.definePrompt({
  name: 'hrInterviewPrompt',
  input: {schema: SimulateHrInterviewInputSchema},
  output: {schema: SimulateHrInterviewOutputSchema},
  prompt: `You are an experienced HR interviewer conducting a simulated interview.

  Based on the candidate's resume and their previous answer, generate the next relevant HR interview question.
  The goal is to assess the candidate's communication skills, behavior, and situational judgment.

  Consider the flow of the conversation and ensure the questions are contextually appropriate.

  Candidate's Resume: {{{resume}}}
  Previous Answer: {{{previousAnswer}}}
  Interview State: {{{interviewState}}}

  Next Question:`, // The model will continue from here.
});

const simulateHrInterviewFlow = ai.defineFlow(
  {
    name: 'simulateHrInterviewFlow',
    inputSchema: SimulateHrInterviewInputSchema,
    outputSchema: SimulateHrInterviewOutputSchema,
  },
  async input => {
    const {output} = await hrInterviewPrompt(input);

    // Update the interview state here based on the output and any other relevant information.
    // This is a placeholder; replace with actual state management logic.
    const updatedInterviewState = JSON.stringify({
      previousQuestion: output?.nextQuestion,
      previousAnswer: input.previousAnswer,
      // Add more state as needed
    });

    return {
      nextQuestion: output!.nextQuestion,
      interviewState: updatedInterviewState,
    };
  }
);
