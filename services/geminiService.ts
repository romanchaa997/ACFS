
import { GoogleGenAI, Type } from "@google/genai";
import { CasinoAnalysis, RiskLevel } from "../types";

const API_KEY = process.env.API_KEY;

export const analyzeCasinoWithGemini = async (url: string): Promise<CasinoAnalysis> => {
  if (!API_KEY) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-3-pro-preview';

  const prompt = `Perform a high-level forensic security audit for the casino domain: ${url}. 
  Examine domain reputation, SSL certificate status (including exact expiration date if possible), license validity, and specific dark patterns in the Terms of Service.
  
  Critical Requirements:
  - Identify the exact license issuer and jurisdiction (e.g. Curacao Gaming, MGA, UKGC).
  - Verify SSL expiration date.
  - Detail specific red flags in TOS with granular explanations (e.g. "Max win cap of $500 on bonuses", "Mandatory 3x wager on raw deposits").
  - Detail payment methods and specifically flag those associated with high fraud risk (e.g. untraceable crypto, obscure third-party processors, non-PCI compliant gateways).

  Respond with a JSON object following the structure:
  {
    "riskScore": number (0-100),
    "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "features": {
      "domainAge": string,
      "sslValid": boolean,
      "sslExpiry": string,
      "licenseFound": boolean,
      "licenseType": string,
      "licenseIssuer": string,
      "licenseJurisdiction": string,
      "regulatorMatch": boolean,
      "tosRedFlags": [
        {"flag": string, "explanation": string}
      ],
      "paymentMethods": [
        {"name": string, "isHighRisk": boolean, "fraudAlert": string}
      ]
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
                    },
                    required: ["flag", "explanation"]
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
                    },
                    required: ["name", "isHighRisk"]
                  }
                }
              },
              required: ["domainAge", "sslValid", "sslExpiry", "licenseFound", "licenseType", "licenseIssuer", "licenseJurisdiction", "regulatorMatch", "tosRedFlags", "paymentMethods"]
            },
            summary: { type: Type.STRING }
          },
          required: ["riskScore", "riskLevel", "features", "summary"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      id: Math.random().toString(36).substr(2, 9),
      url,
      timestamp: new Date().toISOString(),
      ...data
    };
  } catch (error) {
    console.error("Forensic Analysis Error:", error);
    throw error;
  }
};
