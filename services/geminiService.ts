import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Job, CandidateProfile, MatchResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = "gemini-2.5-flash";

// --- Schemas ---

const candidateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    yearsExperience: { type: Type.NUMBER },
    extractedSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          level: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }
        }
      }
    },
    suggestedRoles: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ['summary', 'extractedSkills', 'yearsExperience', 'suggestedRoles']
};

const matchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    matches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobId: { type: Type.STRING },
          matchScore: { type: Type.NUMBER, description: "Score between 0 and 100" },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          reasoning: { type: Type.STRING },
          recommendedCourses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                provider: { type: Type.STRING },
                duration: { type: Type.STRING },
                cost: { type: Type.STRING },
                description: { type: Type.STRING },
                url: { type: Type.STRING, description: "A valid URL or search query URL" }
              }
            }
          }
        },
        required: ['jobId', 'matchScore', 'missingSkills', 'reasoning']
      }
    }
  }
};

// --- Functions ---

export interface ParseInput {
  text?: string;
  file?: {
    data: string; // base64 string
    mimeType: string;
  };
}

export const parseResume = async (input: ParseInput): Promise<CandidateProfile> => {
  try {
    const parts = [];

    if (input.file) {
      parts.push({ 
        inlineData: { 
          mimeType: input.file.mimeType, 
          data: input.file.data 
        } 
      });
      parts.push({ text: "Analyze the resume provided in the file attachment and extract the candidate's profile." });
    } else if (input.text) {
      parts.push({ text: `Analyze the following CV/Resume text:\n"${input.text}"` });
    } else {
      throw new Error("No input provided");
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: candidateSchema,
        systemInstruction: "You are an expert HR recruiter for the South African market. Be generous with extracting skills, inferring soft skills from experience."
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data as CandidateProfile;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
};

export const matchJobs = async (profile: CandidateProfile, jobs: Job[]): Promise<MatchResult[]> => {
  try {
    const jobsContext = jobs.map(j => `ID: ${j.id}, Title: ${j.title}, Desc: ${j.description}, Required: ${j.requiredSkills.join(', ')}`).join('\n---\n');
    
    const prompt = `
    Candidate Profile:
    Summary: ${profile.summary}
    Skills: ${profile.extractedSkills.map(s => s.name).join(', ')}
    Experience: ${profile.yearsExperience} years.

    Available Jobs:
    ${jobsContext}

    Task:
    1. Score the match of the candidate to EACH job (0-100).
    2. Identify critical missing skills for each job.
    3. If there are missing skills, recommend 1-2 upskilling courses specifically relevant to South Africans (e.g. using providers like Udemy, Coursera, ALX, Google Digital Skills for Africa, University of Cape Town Online).
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchSchema,
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data.matches || [];
  } catch (error) {
    console.error("Error matching jobs:", error);
    throw new Error("Failed to match jobs.");
  }
};