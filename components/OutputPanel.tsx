import React from 'react';
import type { AnalysisType, Vulnerability } from '../types';
import { BugIcon } from './icons/BugIcon';
import { SaveIcon } from './icons/SaveIcon';
import { FollowUpPanel } from './FollowUpPanel';
import { VulnerabilityCard } from './VulnerabilityCard';

interface OutputPanelProps {
  result: string | Vulnerability[];
  isLoading: boolean;
  error: string | null;
  analysisType: AnalysisType | null;
  showFollowUp: boolean;
  onDetailedAnalysis: () => Promise<void>;
  detailedQuery: string;
  setDetailedQuery: (query: string) => void;
  setHighlightedLine: (line: number | null) => void;
}

const LoadingState: React.FC<{ analysisType: AnalysisType | null }> = ({ analysisType }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <BugIcon className="w-16 h-16 text-primary animate-pulse" />
        <h3 className="text-2xl font-bold mt-4 text-text-primary">Analyzing...</h3>
        <p className="text-text-secondary mt-2">
            {analysisType ? `Running ${analysisType} analysis.` : 'The AI is thinking.'}
        </p>
        <p className="text-text-secondary mt-1">Please wait a moment.</p>
    </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <BugIcon className="w-16 h-16 text-border-color" />
        <h3 className="text-2xl font-bold mt-4 text-text-primary">Awaiting Analysis</h3>
        <p className="text-text-secondary mt-2 max-w-md">
            Enter some data on the left and select an analysis type to begin your security assessment.
        </p>
    </div>
);

const SimpleTextRenderer: React.FC<{ content: string }> = ({ content }) => {
    // A safe way to render text-based results (e.g., reports, fuzzing lists)
    // preserving whitespace and line breaks without using dangerouslySetInnerHTML.
    return (
        <div className="bg-background p-3 rounded-md">
            <pre className="whitespace-pre-wrap font-mono text-sm text-text-primary">
                {content}
            </pre>
        </div>
    );
};

export const OutputPanel: React.FC<OutputPanelProps> = ({ result, isLoading, error, analysisType, showFollowUp, onDetailedAnalysis, detailedQuery, setDetailedQuery, setHighlightedLine }) => {
  
  const handleSave = () => {
    if (!result) return;
    
    let markdownContent = '';
    if(Array.isArray(result)) {
      markdownContent = result.map(vuln => `
# ${vuln.severity}: ${vuln.name}
      
**Description:**
${vuln.description}

**Location:**
${vuln.location.line_number ? `Line: ${vuln.location.line_number}` : ''}
${vuln.location.code_snippet ? `\`\`\`\n${vuln.location.code_snippet}\n\`\`\`` : ''}

**Remediation:**
${vuln.remediation}

${vuln.poc ? `**Proof of Concept:**\n\`\`\`\n${vuln.poc}\n\`\`\`` : ''}
      `).join('\n\n---\n\n');
    } else {
       markdownContent = result.replace(/<hr>/g, '\n---\n');
    }

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `bug-bounty-analysis-${new Date().toISOString().split('T')[0]}.md`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (isLoading && !result) return <LoadingState analysisType={analysisType}/>;
    if (error) return (
      <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-md">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
    if (!result) return <InitialState />;

    if(Array.isArray(result)) {
        return (
            <div className="space-y-4">
                {result.map((vuln, index) => (
                    <VulnerabilityCard 
                        key={index}
                        vulnerability={vuln}
                        setHighlightedLine={setHighlightedLine}
                    />
                ))}
            </div>
        )
    }
    
    // Fallback for string content
    return <SimpleTextRenderer content={result} />;
  }

  return (
    <div className="bg-surface rounded-lg border border-border-color p-6 h-full flex flex-col shadow-lg">
      <div className="flex justify-between items-center mb-3 sticky top-0 bg-surface pb-3 z-5">
        <h2 className="text-lg font-semibold text-primary">Analysis Output</h2>
        {result && !isLoading && (
            <button 
              onClick={handleSave} 
              className="flex items-center space-x-2 px-3 py-1.5 bg-background border border-border-color rounded-md text-sm font-medium text-text-secondary hover:text-primary hover:border-primary transition-all"
              aria-label="Save analysis"
            >
                <SaveIcon className="w-4 h-4" />
                <span>Save</span>
            </button>
        )}
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 mb-4">
        {renderContent()}
        {isLoading && result && (
            <div className="flex justify-center items-center p-4">
                <BugIcon className="w-6 h-6 text-primary animate-pulse" />
                <p className="ml-2 text-text-secondary">Generating details...</p>
            </div>
        )}
      </div>
       {showFollowUp && (
        <FollowUpPanel
            query={detailedQuery}
            setQuery={setDetailedQuery}
            onAnalyze={onDetailedAnalysis}
            isLoading={isLoading}
        />
      )}
    </div>
  );
};