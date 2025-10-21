
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

async function initializeGenkit() {
    // This API key will be dynamically replaced by the admin panel.
    const apiKey = 'AIzaSyD_CdXD6Gr1n1nH6VfS4yBqffr1qHAnhO8';

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.error("API key is not defined. Please set one in the admin panel.");
        // We throw an error to halt the initialization of the AI plugin.
        throw new Error("No active Gemini API key is configured. Please set one in the admin panel.");
    }
    
    const plugins = [
        googleAI({ apiKey })
    ];

    return genkit({
        plugins,
        model: 'googleai/gemini-1.5-flash-latest',
    });
}

// We are using a promise here so that Genkit initialization is awaited
// throughout the application.
export const ai = await initializeGenkit();
