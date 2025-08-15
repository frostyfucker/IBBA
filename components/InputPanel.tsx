import React, { useMemo, useRef, useEffect } from 'react';
import { AnalysisType } from '../types';
import { ActionButton } from './ActionButton';
import { XssIcon } from './icons/XssIcon';
import { SqlIcon } from './icons/SqlIcon';
import { FuzzIcon } from './icons/FuzzIcon';
import { ReportIcon } from './icons/ReportIcon';
import { ConfigIcon } from './icons/ConfigIcon';
import { ImmunefiIcon } from './icons/ImmunefiIcon';
import { Web3Icon } from './icons/Web3Icon';
import { HackeroneIcon } from './icons/HackeroneIcon';

interface InputPanelProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onAnalyze: (type: AnalysisType) => void;
  isLoading: boolean;
  highlightedLine: number | null;
  language: string;
  setLanguage: (language: string) => void;
}

const generalAnalysisOptions = [
  { type: AnalysisType.XSS, icon: XssIcon, label: 'XSS' },
  { type: AnalysisType.SQLI, icon: SqlIcon, label: 'SQLi' },
  { type: AnalysisType.FUZZING, icon: FuzzIcon, label: 'Fuzz Payloads' },
  { type: AnalysisType.MISCONFIG, icon: ConfigIcon, label: 'Misconfigs' },
  { type: AnalysisType.REPORT, icon: ReportIcon, label: 'Generic Report' },
];

const platformAnalysisOptions = [
  { type: AnalysisType.SMART_CONTRACT, icon: ImmunefiIcon, label: 'Smart Contract Audit' },
  { type: AnalysisType.WEB3_POC, icon: Web3Icon, label: 'Web3 PoC' },
  { type: AnalysisType.H1_REPORT, icon: HackeroneIcon, label: 'HackerOne Report' },
];

export const InputPanel: React.FC<InputPanelProps> = ({ userInput, setUserInput, onAnalyze, isLoading, highlightedLine, language, setLanguage }) => {
  const lineCount = useMemo(() => userInput.split('\n').length, [userInput]);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = () => {
    if (lineGutterRef.current && textareaRef.current) {
      lineGutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border-color p-6 flex flex-col h-full shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <label htmlFor="userInput" className="text-lg font-semibold text-primary">
            Enter Code, Description, or Logs
        </label>
        <div className="flex items-center space-x-2">
            <label htmlFor="language-select" className="text-sm font-medium text-text-secondary">Language:</label>
            <select 
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isLoading}
                className="bg-background border border-border-color rounded-md px-2 py-1 text-sm text-text-primary focus:ring-1 focus:ring-primary focus:border-primary"
                aria-label="Select code language"
            >
                <option value="auto">Auto-Detect</option>
                <option value="Rust (Solana)">Rust (Solana)</option>
                <option value="Solidity (EVM)">Solidity (EVM)</option>
                <option value="JavaScript/TypeScript">JavaScript/TypeScript</option>
                <option value="Go">Go</option>
                <option value="Python">Python</option>
            </select>
        </div>
      </div>
      <div className="w-full flex-grow flex border border-border-color rounded-md bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
        <div ref={lineGutterRef} className="text-right p-4 pr-3 select-none text-text-secondary font-mono text-sm overflow-y-hidden bg-background border-r border-border-color">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className={`h-[21px] ${highlightedLine === i + 1 ? 'text-primary font-bold' : ''}`}>
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onScroll={handleScroll}
          placeholder="e.g., paste a Solidity contract, describe a bug, or provide server headers..."
          className="w-full h-full bg-transparent p-4 text-text-primary resize-none font-mono text-sm focus:outline-none leading-[21px]"
          rows={15}
          disabled={isLoading}
          spellCheck="false"
        />
      </div>
      <div className="mt-6 space-y-6">
        <div>
          <p className="text-lg font-semibold text-primary mb-3">General Analysis</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {generalAnalysisOptions.map((option) => (
              <ActionButton
                key={option.type}
                label={option.label}
                onClick={() => onAnalyze(option.type)}
                isLoading={isLoading}
                Icon={option.icon}
              />
            ))}
          </div>
        </div>
         <div>
          <p className="text-lg font-semibold text-primary mb-3">Platform-Specific Tools</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {platformAnalysisOptions.map((option) => (
              <ActionButton
                key={option.type}
                label={option.label}
                onClick={() => onAnalyze(option.type)}
                isLoading={isLoading}
                Icon={option.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};