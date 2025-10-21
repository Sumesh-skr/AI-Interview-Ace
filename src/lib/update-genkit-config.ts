
'use server';

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Updates the API key in the genkit.ts configuration file.
 * @param newApiKey The new API key to write to the file.
 */
export async function updateApiKeyInGenkitConfig(newApiKey: string) {
  const genkitConfigPath = path.join(process.cwd(), 'src', 'ai', 'genkit.ts');

  try {
    const originalContent = await fs.readFile(genkitConfigPath, 'utf-8');

    // Use a regular expression to find and replace the apiKey value.
    // This is more robust than simple string replacement.
    const updatedContent = originalContent.replace(
      /const apiKey = '.*';/,
      `const apiKey = '${newApiKey}';`
    );

    if (originalContent === updatedContent) {
        throw new Error("Did not find a line to replace in genkit.ts. The file content might have changed.");
    }

    await fs.writeFile(genkitConfigPath, updatedContent, 'utf-8');
    
    console.log(`Successfully updated API key in ${genkitConfigPath}`);
    return { success: true };

  } catch (error) {
    console.error('Failed to update genkit.ts:', error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
}
