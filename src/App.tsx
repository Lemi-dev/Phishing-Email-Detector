/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion, 
  AlertTriangle, 
  Search, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeEmail, PhishingAnalysis, RiskLevel } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [emailText, setEmailText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PhishingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!emailText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeEmail(emailText);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze email. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setEmailText('');
    setAnalysis(null);
    setError(null);
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return 'risk-low';
      case RiskLevel.MEDIUM: return 'risk-medium';
      case RiskLevel.HIGH: return 'risk-high';
      default: return '';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
      case RiskLevel.MEDIUM: return <ShieldQuestion className="w-6 h-6 text-amber-500" />;
      case RiskLevel.HIGH: return <ShieldAlert className="w-6 h-6 text-rose-500" />;
      default: return <ShieldQuestion className="w-6 h-6 text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-bottom border-zinc-200 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 p-1.5 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">PhishGuard AI</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
            <span className="hidden sm:inline">Advanced Email Security Analysis</span>
            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
            <button 
              onClick={reset}
              className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8">
        {/* Input Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Paste Email Content</h2>
            <span className="text-xs text-zinc-400 font-mono">v1.0.2</span>
          </div>
          
          <div className="relative group">
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste the suspicious email text here..."
              className="w-full h-64 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none font-sans text-zinc-700 placeholder:text-zinc-300"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !emailText.trim()}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm",
                  isAnalyzing || !emailText.trim() 
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                    : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Scan Email
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {analysis ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Risk Score Card */}
                <div className={cn("md:col-span-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center space-y-4", getRiskColor(analysis.riskLevel))}>
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    {getRiskIcon(analysis.riskLevel)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">Risk Level</h3>
                    <p className="text-4xl font-black">{analysis.riskLevel}</p>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.score}%` }}
                      className={cn("h-full", 
                        analysis.riskLevel === RiskLevel.LOW ? "bg-emerald-500" :
                        analysis.riskLevel === RiskLevel.MEDIUM ? "bg-amber-500" : "bg-rose-500"
                      )}
                    />
                  </div>
                  <p className="text-xs font-semibold opacity-60">Security Score: {100 - analysis.score}/100</p>
                </div>

                {/* Summary Card */}
                <div className="md:col-span-2 p-6 bg-white border border-zinc-200 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <Info className="w-5 h-5" />
                    <h3 className="font-semibold">AI Assessment Summary</h3>
                  </div>
                  <p className="text-zinc-600 leading-relaxed">
                    {analysis.summary}
                  </p>
                  <div className="pt-4 border-t border-zinc-100">
                    <div className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                      <CheckCircle2 className="w-5 h-5 text-zinc-900 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Recommendation</p>
                        <p className="text-sm text-zinc-700 font-medium">{analysis.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reasons */}
                <div className="p-6 bg-white border border-zinc-200 rounded-2xl space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-zinc-400" />
                    Risk Indicators
                  </h3>
                  <ul className="space-y-3">
                    {analysis.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suspicious Phrases */}
                <div className="p-6 bg-white border border-zinc-200 rounded-2xl space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Search className="w-5 h-5 text-zinc-400" />
                    Suspicious Phrases
                  </h3>
                  <div className="space-y-3">
                    {analysis.suspiciousPhrases.map((item, i) => (
                      <div key={i} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-1">
                        <p className="text-sm font-mono font-bold text-rose-600">"{item.phrase}"</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : !isAnalyzing && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                <ShieldQuestion className="w-8 h-8 text-zinc-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-zinc-900">Ready for Scan</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                  Paste an email message above to analyze it for potential phishing threats and security risks.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white p-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            © 2024 PhishGuard AI. Powered by Gemini 3.1 Flash.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1">
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1">
              Security Guide
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
