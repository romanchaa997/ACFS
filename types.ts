
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface RedFlag {
  flag: string;
  explanation: string;
}

export interface PaymentMethod {
  name: string;
  isHighRisk: boolean;
  fraudAlert?: string;
}

export type IntegrationStatus = 'PENDING' | 'SYNCING' | 'SUCCESS' | 'FAILED';

export interface CasinoAnalysis {
  id: string;
  url: string;
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
  probability: number; // 1-5
  impact: number;      // 1-5
  zone: 'FRONT' | 'NEAR_FRONT' | 'REAR';
  threatVector: string[];
  securityState: {
    pqc: 'FULL' | 'PARTIAL' | 'OFF';
    secureBoot: boolean;
    idsEnabled: boolean;
  };
  features: {
    domainAge: string;
    sslValid: boolean;
    sslExpiry: string;
    licenseFound: boolean;
    licenseType: string;
    licenseIssuer: string;
    licenseJurisdiction: string;
    regulatorMatch: boolean;
    tosRedFlags: RedFlag[];
    paymentMethods: PaymentMethod[];
  };
  summary: string;
  integration: IntegrationStatus;
}

export interface UserPlan {
  name: string;
  scansUsed: number;
  scansLimit: number;
  apiEnabled: boolean;
  tier: 'Free' | 'Pro' | 'Enterprise';
}
