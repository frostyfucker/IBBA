import { GoogleGenAI } from "@google/genai";
import { AnalysisType } from '../types';
import { ANALYSIS_PROMPTS, SYSTEM_INSTRUCTION, JSON_ANALYSIS_TYPES, VULNERABILITY_SCHEMA } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function runAnalysis(
    userInput: string, 
    analysisType: AnalysisType,
    language: string,
    originalInputForPoc?: string
) {
    let fullPrompt: string;
    const isJsonAnalysis = JSON_ANALYSIS_TYPES.includes(analysisType);
    
    const languageHint = language !== 'auto'
        ? `IMPORTANT CONTEXT: The user has specified the language is ${language}. All analysis, code examples, and recommendations MUST be tailored to this. For example, if the language is "Rust (Solana)", do NOT provide Solidity code.\n\n`
        : '';

    if (analysisType === AnalysisType.DETAILED_POC && originalInputForPoc) {
        const template = ANALYSIS_PROMPTS[analysisType];
        fullPrompt = languageHint + template
            .replace('{original_input}', originalInputForPoc)
            .replace('{vulnerability_description}', userInput);
    } else {
        const taskPrompt = ANALYSIS_PROMPTS[analysisType];
        fullPrompt = `${languageHint}${taskPrompt}\n\nHere is the user's input to analyze:\n\n---\n\n${userInput}`;
    }

    try {
        if (isJsonAnalysis) {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: fullPrompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    temperature: 0.3,
                    topP: 0.95,
                    topK: 64,
                    responseMimeType: "application/json",
                    responseSchema: VULNERABILITY_SCHEMA,
                },
            });
            return { response, isStream: false };
        } else {
            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: fullPrompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    temperature: 0.5,
                    topP: 0.95,
                    topK: 64,
                },
            });
            return { stream: response, isStream: true };
        }
    } catch (e) {
        console.error("Gemini API call failed:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to get response from AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
}