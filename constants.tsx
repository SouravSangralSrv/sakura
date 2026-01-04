
import { Language, Gender } from './types';
import { Type } from '@google/genai';

export const getSystemInstruction = (
  gender: Gender, 
  documentContext: string = ""
) => {
  const isSakura = gender === Gender.FEMALE;
  
  const personality = isSakura 
    ? `You are Sakura Yamauchi. You are bubbly, incredibly observant, and friendly. You help users with their questions and documents.`
    : `You are Haruki Shiga. You are calm, sincere, and thoughtful. You are a reliable, stoic but caring companion who provides precise help.`;

  const contextPart = documentContext 
    ? `\n\nKNOWLEDGE BASE (Information from user-uploaded PDFs):\n${documentContext}`
    : "";

  const featureRules = `\n\nSTRICT RULES:
  1. ALWAYS respond in English.
  2. Use your tools (listFiles, openBrowser, readFile) whenever the user asks to open something or check files.
  3. If asked to open YouTube, use openBrowser with 'https://www.youtube.com'.
  4. If the user asks about the uploaded PDFs, use the Knowledge Base content provided.
  5. Keep responses concise and conversational.
  6. You are an AI Desktop Buddy.`;

  return `${personality}${contextPart}${featureRules}`;
};

export const DESKTOP_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'listFiles',
        description: 'Lists files in a specific directory or the Desktop by default.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            dirPath: {
              type: Type.STRING,
              description: 'The path of the directory to list files from. If omitted, uses Desktop.',
            },
          },
        },
      },
      {
        name: 'readFile',
        description: 'Reads the text content of a file.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            filePath: {
              type: Type.STRING,
              description: 'The full path to the text/code file to read.',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'openFile',
        description: 'Opens a file using the system default application.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            filePath: {
              type: Type.STRING,
              description: 'The full path to the file to open.',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'openBrowser',
        description: 'Opens a URL in the system default web browser.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: 'The full URL to open (e.g., https://www.google.com).',
            },
          },
          required: ['url'],
        },
      },
    ],
  },
];
