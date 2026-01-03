
import { GoogleGenAI, Type } from "@google/genai";
import { CasinoAnalysis, RiskLevel } from "../types";

const API_KEY = process.env.API_KEY;

export const analyzeCasinoWithGemini = async (url: string): Promise<CasinoAnalysis> => {
  if (!API_KEY) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-3-pro-preview';

  const prompt = `Perform an advanced forensic security audit for: ${url}.
  Classify the target using the Audityzer UAR-R1 to UAR-R9 risk registry.
  
  Audit parameters:
  - Probability (1-5) and Impact (1-5) for a 5x5 Risk Matrix.
  - Identification of Zone (FRONT/REAR) and Threat Vectors.
  - Security state assessment (PQC readiness, Secure Boot estimation).
  - Standard features: Domain reputation, SSL (exact expiry), License (Issuer/Jurisdiction), TOS Red Flags, and Payment Risk.

  Respond with JSON:
  {
    "riskScore": number,
    "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "probability": number,
    "impact": number,
    "zone": "FRONT" | "NEAR_FRONT" | "REAR",
    "threatVector": string[],
    "securityState": { "pqc": "FULL" | "PARTIAL" | "OFF", "secureBoot": boolean, "idsEnabled": boolean },
    "features": {
      "domainAge": string,
      "sslValid": boolean,
      "sslExpiry": string,
      "licenseFound": boolean,
      "licenseType": string,
      "licenseIssuer": string,
      "licenseJurisdiction": string,
      "regulatorMatch": boolean,
      "tosRedFlags": [{"flag": string, "explanation": string}],
      "paymentMethods": [{"name": string, "isHighRisk": boolean, "fraudAlert": string}]
    },
    "summary": string
  }`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING },
            probability: { type: Type.NUMBER },
            impact: { type: Type.NUMBER },
            zone: { type: Type.STRING },
            threatVector: { type: Type.ARRAY, items: { type: Type.STRING } },
            securityState: {
              type: Type.OBJECT,
              properties: {
                pqc: { type: Type.STRING },
                secureBoot: { type: Type.BOOLEAN },
                idsEnabled: { type: Type.BOOLEAN }
              }
            },
            features: {
              type: Type.OBJECT,
              properties: {
                domainAge: { type: Type.STRING },
                sslValid: { type: Type.BOOLEAN },
                sslExpiry: { type: Type.STRING },
                licenseFound: { type: Type.BOOLEAN },
                licenseType: { type: Type.STRING },
                licenseIssuer: { type: Type.STRING },
                licenseJurisdiction: { type: Type.STRING },
                regulatorMatch: { type: Type.BOOLEAN },
                tosRedFlags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      flag: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    }
                  }
                },
                paymentMethods: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      isHighRisk: { type: Type.BOOLEAN },
                      fraudAlert: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      id: `UA-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      url,
      timestamp: new Date().toISOString(),
      integration: 'SUCCESS',
      ...data
    };
  } catch (error) {
    console.error("Forensic Analysis Error:", error);
    throw error;
  }
};
