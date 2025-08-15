import { Type } from '@google/genai';
import type { AnalysisType } from './types';
import { AnalysisType as AnalysisTypeEnum } from './types';

export const SYSTEM_INSTRUCTION = `You are an expert bug bounty assistant specializing in web and smart contract security.
Your goal is to help users identify potential vulnerabilities with precision.
Provide clear, concise, and actionable advice.

CRITICAL INSTRUCTION: You MUST detect the programming language and blockchain ecosystem from the user's input. If the user provides Rust code for Solana, ALL of your analysis, code examples, and remediation advice MUST be in Rust and relevant to Solana. DO NOT provide Solidity or EVM advice for a Solana project. Conversely, if the code is Solidity, provide EVM-specific advice. Your response must be contextually appropriate to the provided code.

When identifying a vulnerability in the provided code, you MUST make every effort to include the exact line number in the 'location' object of your response.
Always format code snippets, commands, and payloads in markdown code blocks within the JSON string fields.
Your tone should be professional, helpful, and slightly futuristic.`;

export const VULNERABILITY_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'The name of the vulnerability (e.g., "Stored Cross-Site Scripting").' },
      description: { type: Type.STRING, description: 'A detailed explanation of the vulnerability.' },
      severity: { type: Type.STRING, description: 'Severity rating: Critical, High, Medium, Low, or Informational.', enum: ['Critical', 'High', 'Medium', 'Low', 'Informational'] },
      location: {
        type: Type.OBJECT,
        description: 'Where the vulnerability is located.',
        properties: {
          file: { type: Type.STRING, description: 'The name of the file, if applicable.' },
          line_number: { type: Type.INTEGER, description: 'The precise line number of the vulnerable code.' },
          code_snippet: { type: Type.STRING, description: 'The vulnerable line or block of code.' },
        },
      },
      remediation: { type: Type.STRING, description: 'Actionable advice and code examples for fixing the vulnerability.' },
      poc: { type: Type.STRING, description: 'A proof-of-concept string or code block to demonstrate the exploit.' },
    },
    required: ['name', 'description', 'severity', 'location', 'remediation'],
  },
};

export const ANALYSIS_PROMPTS: Record<AnalysisType, string> = {
  [AnalysisTypeEnum.XSS]: `Analyze the following code/description for potential Cross-Site Scripting (XSS) vulnerabilities. Identify the type (reflected, stored, DOM-based), explain the attack vector, and provide mitigation strategies.`,
  [AnalysisTypeEnum.SQLI]: `Analyze the following code/description for potential SQL Injection (SQLi) vulnerabilities (in-band, blind, out-of-band). Explain the exploit mechanism and recommend remediation using parameterized queries.`,
  [AnalysisTypeEnum.MISCONFIG]: `Analyze the provided context (e.g., app description, server headers, file contents) for common security misconfigurations. Look for issues like verbose errors, exposed sensitive files, missing security headers, default credentials, or insecure cookie settings.`,
  [AnalysisTypeEnum.SMART_CONTRACT]: `Act as an expert smart contract auditor. Analyze the provided smart contract code for common and advanced vulnerabilities relevant to its specific language and ecosystem. For Rust/Solana, look for insecure cross-program invocation (CPI), account data validation, ownership/borrowing misuse, and integer overflows. For Solidity/EVM, look for reentrancy, access control issues, unsafe delegatecall, and business logic flaws.`,
  [AnalysisTypeEnum.FUZZING]: `Generate a list of 15 diverse and creative fuzzing payloads for the described feature or parameter. Categorize them by attack type (e.g., XSS, SQLi, LFI, Command Injection). The payloads should be creative and test for edge cases.`,
  [AnalysisTypeEnum.REPORT]: `Based on the following vulnerability description, write a professional, clear, and concise bug bounty report draft. The report must include the following sections, clearly marked:
- **Title:** A descriptive title (e.g., "Stored XSS on User Profile Page").
- **Vulnerability Type:** The specific CWE if possible.
- **Location:** The vulnerable URL/parameter.
- **Impact:** A clear description of what an attacker could achieve.
- **Steps to Reproduce:** A numbered list of clear, simple steps to trigger the vulnerability.
- **Remediation:** Actionable advice for developers to fix the issue.`,
  [AnalysisTypeEnum.WEB3_POC]: `Based on the following smart contract vulnerability description, generate a complete, runnable proof-of-concept (PoC) exploit script. The PoC MUST use a testing framework appropriate for the code's language and ecosystem (e.g., Anchor/solana-program-test for Rust, Foundry/Hardhat for Solidity). It must clearly demonstrate the vulnerability's impact and include comments explaining each step of the exploit chain.`,
  [AnalysisTypeEnum.H1_REPORT]: `Draft a high-quality, professional vulnerability report suitable for submission to HackerOne, based on the user's input. The report must be structured with the following sections, using Markdown for formatting:
- **Summary:** A concise, one-sentence summary of the vulnerability and its impact.
- **Platform:** (e.g., Web, iOS, Android)
- **Vulnerability Type:** (e.g., CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting'))
- **Vulnerable Endpoint(s):** The specific URL, parameter, or location.
- **Description:** A detailed explanation of the vulnerability.
- **Steps to Reproduce:** A clear, numbered list of steps a triager can follow to validate the finding.
- **Proof of Concept (PoC):** Include any necessary code, scripts, or HTTP requests.
- **Impact:** Describe the potential harm to the business or users.
- **Suggested Remediation:** Provide actionable advice for fixing the vulnerability.
- **Suggested CVSS:** Provide a CVSS 3.1 Vector String and Score (e.g., CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N, Score: 6.1).`,
  [AnalysisTypeEnum.DETAILED_POC]: `Given the following original code/context and a specific vulnerability found within it, generate a detailed follow-up analysis. The analysis must provide:

1.  **Precise Location:** The exact file, function, and line number(s) where the vulnerability exists.
2.  **Detailed Steps to Reproduce:** A clear, numbered list of actions an engineer can take to see the vulnerability in action.
3.  **Proof of Concept (PoC):** A complete, runnable code snippet (e.g., an HTTP request, a JavaScript payload, a curl command) that actively demonstrates the exploit.

---
**Original Code/Context:**
\`\`\`
{original_input}
\`\`\`

---
**Vulnerability to Detail:**
{vulnerability_description}

---
Begin your detailed analysis now.`,
};

export const JSON_ANALYSIS_TYPES = [
  AnalysisTypeEnum.XSS,
  AnalysisTypeEnum.SQLI,
  AnalysisTypeEnum.MISCONFIG,
  AnalysisTypeEnum.SMART_CONTRACT,
];