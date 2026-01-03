
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

export interface CasinoAnalysis {
  id: string;
  url: string;
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
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
}

export interface RegulatoryStatus {
  source: 'KRAIL' | 'PlayCity' | 'UKGC' | 'MGA';
  lastSync: string;
  status: 'Operational' | 'Syncing' | 'Error';
  count: number;
}

export interface UserPlan {
  name: string;
  scansUsed: number;
  scansLimit: number;
  apiEnabled: boolean;
  tier: 'Free' | 'Pro' | 'Enterprise';
}
