'use server';

/**
 * @fileOverview AI-powered tool to automatically generate tags based on note content.
 *
 * - generateNoteTags - A function that handles the note tag generation process.
 * - GenerateNoteTagsInput - The input type for the generateNoteTags function.
 * - GenerateNoteTagsOutput - The return type for the generateNoteTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNoteTagsInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to generate tags for.'),
});
export type GenerateNoteTagsInput = z.infer<typeof GenerateNoteTagsInputSchema>;

const GenerateNoteTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of tags generated for the note content.'),
});
export type GenerateNoteTagsOutput = z.infer<typeof GenerateNoteTagsOutputSchema>;

export async function generateNoteTags(input: GenerateNoteTagsInput): Promise<GenerateNoteTagsOutput> {
  return generateNoteTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNoteTagsPrompt',
  input: {schema: GenerateNoteTagsInputSchema},
  output: {schema: GenerateNoteTagsOutputSchema},
  prompt: `You are a tagging expert. Given the content of a note, you will generate relevant tags to help categorize the note.

Note Content: {{{noteContent}}}

Tags:`,
});

const generateNoteTagsFlow = ai.defineFlow(
  {
    name: 'generateNoteTagsFlow',
    inputSchema: GenerateNoteTagsInputSchema,
    outputSchema: GenerateNoteTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
