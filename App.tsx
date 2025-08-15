import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { runAnalysis } from './services/geminiService';
import { AnalysisType, Vulnerability } from './types';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [initialUserInput, setInitialUserInput] = useState<string>('');
  const [detailedQuery, setDetailedQuery] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | Vulnerability[]>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisType | null>(null);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [language, setLanguage] = useState<string>('auto');

  const handleAnalysis = useCallback(async (analysisType: AnalysisType) => {
    if (!userInput.trim()) {
      setError("Please enter some code or a description to analyze.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult('');
    setInitialUserInput(userInput);
    setCurrentAnalysis(analysisType);
    setHighlightedLine(null);

    try {
      const result = await runAnalysis(userInput, analysisType, language);
      if (result.isStream) {
        for await (const chunk of result.stream) {
          setAnalysisResult((prev) => (typeof prev === 'string' ? prev + chunk.text : chunk.text));
        }
      } else {
        const jsonText = result.response?.text;
        if (jsonText) {
          try {
            // Defensively check if the response looks like JSON before parsing.
            if (jsonText.trim().startsWith('[') || jsonText.trim().startsWith('{')) {
                const parsedJson = JSON.parse(jsonText);
                setAnalysisResult(parsedJson);
            } else {
                console.error("AI returned non-JSON text when JSON was expected:", jsonText);
                setError("AI returned a non-JSON response. Displaying raw text instead.");
                setAnalysisResult(jsonText);
            }
          } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            console.error("Raw text from AI:", jsonText);
            setError("AI returned invalid JSON. Displaying raw text instead.");
            setAnalysisResult(jsonText);
          }
        } else {
          // This case handles blocked or empty model responses.
          console.error("AI response for JSON analysis was empty or undefined.", result.response);
          const finishReason = result.response?.candidates?.[0]?.finishReason;
          let errorMessage = "The AI did not return a valid response. This could be due to content restrictions. Please try modifying your input.";
          
          if (finishReason === 'SAFETY') {
            errorMessage = `The response was blocked due to safety concerns. Please adjust your input to be less sensitive.`;
          } else if (finishReason && finishReason !== 'STOP') {
            errorMessage = `The response generation stopped prematurely. Reason: ${finishReason}.`;
          }
          setError(errorMessage);
          setAnalysisResult('');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [userInput, language]);

  const handleDetailedAnalysis = useCallback(async () => {
    if (!detailedQuery.trim()) {
      setError("Please describe the vulnerability for detailed analysis.");
      return;
    }
    if (!initialUserInput) {
      setError("Initial context is missing. Please run a general analysis first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentAnalysis(AnalysisType.DETAILED_POC);
    setHighlightedLine(null);

    const isJsonOutput = Array.isArray(analysisResult);
    const resultSeparator = isJsonOutput ? '' : '\n\n<hr>\n\n';

    if (!isJsonOutput) {
        setAnalysisResult(prev => prev + `${resultSeparator}## Detailed Analysis: ${detailedQuery}\n`);
    }

    try {
        const result = await runAnalysis(detailedQuery, AnalysisType.DETAILED_POC, language, initialUserInput);
        // Detailed analysis is always streaming
        if (result.isStream) {
            let tempResult = '';
             for await (const chunk of result.stream) {
                tempResult += chunk.text;
             }
             if (isJsonOutput) {
                 setAnalysisResult(prev => [...(prev as Vulnerability[]), { name: `Detailed Analysis: ${detailedQuery}`, description: tempResult, severity: 'Informational', location: {}, remediation: '' }]);
             } else {
                 setAnalysisResult(prev => prev + tempResult);
             }
        }

    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred during detailed analysis.");
    } finally {
        setIsLoading(false);
        setDetailedQuery('');
    }
  }, [detailedQuery, initialUserInput, analysisResult, language]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputPanel
          userInput={userInput}
          setUserInput={setUserInput}
          onAnalyze={handleAnalysis}
          isLoading={isLoading}
          highlightedLine={highlightedLine}
          language={language}
          setLanguage={setLanguage}
        />
        <OutputPanel
          result={analysisResult}
          isLoading={isLoading}
          error={error}
          analysisType={currentAnalysis}
          onDetailedAnalysis={handleDetailedAnalysis}
          detailedQuery={detailedQuery}
          setDetailedQuery={setDetailedQuery}
          showFollowUp={!!initialUserInput && !!analysisResult && !isLoading}
          setHighlightedLine={setHighlightedLine}
        />
      </main>
      <footer className="text-center p-4 text-text-secondary text-sm">
          <p>AI-generated content may be inaccurate. Always verify results and test responsibly.</p>
          <p>&copy; 2024 Intelligent Bug Bounty Assistant</p>
      </footer>
    </div>
  );
};

export default App;