
'use server';

/**
 * @fileOverview Manages the AI interview process, including generating questions and analyzing responses.
 *
 * - aiInterview - A function that orchestrates the AI interview, asking questions and generating a report.
 * - AiInterviewInput - The input type for the aiInterview function.
 * - AiInterviewOutput - The return type for the aiInterview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionAnalysisSchema = z.object({
  question: z.string().describe('The interview question that was asked.'),
  answer: z.string().describe("The student's answer to the question."),
  feedback: z.string().describe('Specific feedback on the student\'s answer.'),
  score: z.number().min(0).max(100).describe('A score from 0-100 for the answer.'),
});

const ReportSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('The final overall score for the interview, from 0 to 100.'),
  overallFeedback: z.string().describe('A summary of the overall performance.'),
  strengths: z.array(z.string()).describe('A list of the student\'s key strengths.'),
  areasForImprovement: z.array(z.string()).describe('A list of areas where the student can improve.'),
  questionAnalysis: z.array(QuestionAnalysisSchema).describe('A detailed analysis for each question and answer.'),
});

const AiInterviewInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "Resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  interviewType: z.enum(['hr', 'technical']).describe('Type of interview (hr or technical).'),
  technicalSubsection: z
    .string()
    .optional()
    .describe('Specific technical area for the interview (e.g., full stack, frontend). Required if interviewType is technical.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the interview.'),
  questions: z.array(z.string()).describe('The questions that were asked during the interview.'),
  answers: z.array(z.string()).describe('The student\'s answers to the questions.'),
});
export type AiInterviewInput = z.infer<typeof AiInterviewInputSchema>;

const AiInterviewOutputSchema = z.object({
  questions: z.array(z.string()).optional().describe('The interview questions to ask the student.'),
  report: ReportSchema.optional().describe('The final interview report (generated after all questions are answered).'),
});
export type AiInterviewOutput = z.infer<typeof AiInterviewOutputSchema>;

export async function aiInterview(input: AiInterviewInput): Promise<AiInterviewOutput> {
  return aiInterviewFlow(input);
}

const interviewPrompt = ai.definePrompt({
  name: 'interviewPrompt',
  input: {schema: z.object({
    resumeDataUri: AiInterviewInputSchema.shape.resumeDataUri,
    interviewType: AiInterviewInputSchema.shape.interviewType,
    technicalSubsection: AiInterviewInputSchema.shape.technicalSubsection,
    difficulty: AiInterviewInputSchema.shape.difficulty,
  })},
  output: {schema: z.object({
    questions: z.array(z.string()).describe("A list of 3 interview questions."),
  })},
  prompt: `You are a friendly AI interviewer. Your goal is to conduct a realistic and conversational interview with a student.
  
  Generate a list of 3 interview questions for a {{difficulty}} level interview.
  Keep your questions simple and short. 
  The questions should cover different topics relevant to the interview type and the student's resume.

  The student has provided their resume.
  Resume: {{media url=resumeDataUri}}

  The interview is of type: {{interviewType}}
  {{#if technicalSubsection}}The technical subsection is: {{technicalSubsection}}{{/if}}
  
  Based on the resume, generate the 3 interview questions.
  `,
});

const reportPrompt = ai.definePrompt({
  name: 'reportPrompt',
  input: {schema: z.object({
    resumeDataUri: AiInterviewInputSchema.shape.resumeDataUri,
    interviewType: AiInterviewInputSchema.shape.interviewType,
    technicalSubsection: AiInterviewInputSchema.shape.technicalSubsection,
    difficulty: AiInterviewInputSchema.shape.difficulty,
    questions: AiInterviewInputSchema.shape.questions,
    answers: AiInterviewInputSchema.shape.answers,
  })},
  output: {schema: ReportSchema},
  prompt: `You are an expert AI performance analyst. Your task is to generate a comprehensive, structured report based on an interview transcript and a resume. The interview difficulty was {{difficulty}}.

  **Instructions:**
  1.  Analyze the provided resume and interview transcript (questions and answers).
  2.  For each question and answer pair, provide specific, constructive feedback and a score from 0 to 100. Your evaluation and score must be calibrated to the interview's difficulty level. For an 'easy' interview, expect clear, fundamental answers. For a 'hard' interview, expect nuanced, in-depth responses.
  3.  Based on the entire interview, identify the student's key strengths and areas for improvement.
  4.  Provide a final, overall performance score from 0 to 100, which also considers the interview's difficulty.
  5.  Write a brief summary of the student's overall performance.

  **Source Information:**
  - Resume: {{media url=resumeDataUri}}
  - Interview Type: {{interviewType}}
  - Difficulty: {{difficulty}}
  {{#if technicalSubsection}}- Technical Subsection: {{technicalSubsection}}{{/if}}
  
  **Interview Transcript:**
  {{#each questions}}
  - Question: {{this}}
  - Answer: {{lookup ../answers @index}}
  {{/each}}

  **Output Format:**
  Please provide the output in the specified JSON format.
  `,
});

const aiInterviewFlow = ai.defineFlow(
  {
    name: 'aiInterviewFlow',
    inputSchema: AiInterviewInputSchema,
    outputSchema: AiInterviewOutputSchema,
  },
  async (input) => {
    // If answers are provided, we are generating a report.
    if (input.answers && input.answers.length > 0) {
      const { output } = await reportPrompt(input);
      return { report: output! };
    } 
    
    // For technical interviews, generate questions using AI.
    // For HR interviews, questions are now fetched on the client and passed in.
    if (input.interviewType === 'technical') {
      const { output } = await interviewPrompt(input);
      return { questions: output!.questions };
    }

    // If it's an HR interview and we are at the question generation stage,
    // the questions are expected to be passed in from the client.
    // We just return them. If they are not present, it's an issue on the client side.
    if (input.interviewType === 'hr') {
        return { questions: input.questions };
    }
    
    // Fallback for any other case
    return {};
  }
);
