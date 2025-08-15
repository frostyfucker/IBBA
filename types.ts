export enum AnalysisType {
  XSS = 'Cross-Site Scripting (XSS)',
  SQLI = 'SQL Injection (SQLi)',
  FUZZING = 'Fuzzing Payload Generation',
  REPORT = 'Vulnerability Report Draft',
  MISCONFIG = 'Common Misconfigurations',
  SMART_CONTRACT = 'Smart Contract Audit',
  WEB3_POC = 'Web3 PoC Generator',
  H1_REPORT = 'HackerOne Report',
  DETAILED_POC = 'Detailed PoC & Steps',
}

export interface Vulnerability {
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  location: {
    file?: string;
    line_number?: number;
    code_snippet?: string;
  };
  remediation: string;
  poc?: string;
}
