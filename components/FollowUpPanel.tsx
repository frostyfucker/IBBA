
import React from 'react';
import { ActionButton } from './ActionButton';
import { PocIcon } from './icons/PocIcon';
import { AnalysisType } from '../types';

interface FollowUpPanelProps {
    query: string;
    setQuery: (value: string) => void;
    onAnalyze: () => void;
    isLoading: boolean;
}

export const FollowUpPanel: React.FC<FollowUpPanelProps> = ({ query, setQuery, onAnalyze, isLoading }) => {
    return (
        <div className="mt-4 pt-4 border-t-2 border-border-color/50">
            <label htmlFor="followUpInput" className="text-lg font-semibold text-primary mb-3 block">
                Follow-up Analysis
            </label>
            <textarea
                id="followUpInput"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'Give me a detailed PoC for the Stored XSS vulnerability mentioned above...'"
                className="w-full bg-background border border-border-color rounded-md p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none font-mono text-sm"
                rows={3}
                disabled={isLoading}
            />
            <div className="mt-3">
                <ActionButton
                    label="Generate PoC & Steps"
                    onClick={onAnalyze}
                    isLoading={isLoading}
                    Icon={PocIcon}
                />
            </div>
        </div>
    );
};
