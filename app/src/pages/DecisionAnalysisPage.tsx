import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  
  TrendingUp,
  
  Shield,
  Brain,
  Sparkles,
  Loader2,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const CRITERIA_LABELS: Record<string, string> = {
  timeEfficiency: "Time Efficiency",
  riskLevel: "Risk Level",
  productivityImpact: "Productivity Impact",
  mentalStress: "Mental Stress",
  costResources: "Cost/Resources",
  longTermBenefit: "Long-term Benefit",
  difficulty: "Difficulty",
  opportunityCost: "Opportunity Cost",
};

function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color =
    score >= 7 ? "from-green-500 to-green-400"
    : score >= 4 ? "from-yellow-500 to-yellow-400"
    : "from-red-500 to-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{score.toFixed(1)}</span>
    </div>
  );
}

export default function DecisionAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const decisionId = Number(id);
  const [expandedOption, setExpandedOption] = useState<number | null>(0);

  const { data: decision } = trpc.decision.getById.useQuery(
    { id: decisionId },
    { enabled: !!id },
  );

  const { data: analysis } = trpc.analysis.getByDecisionId.useQuery(
    { decisionId },
    { enabled: !!id },
  );

  if (!decision) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00e5c0]" />
        </div>
      </AppLayout>
    );
  }

  const analysisData = analysis
    ? {
        summary: analysis.summary || "",
        confidence: analysis.confidence || 0,
        recommendation: analysis.recommendation || "",
        reasoning: analysis.reasoning || "",
        optionsAnalysis: (analysis.optionsAnalysis as any[]) || [],
        tradeOffMatrix: (analysis.tradeOffMatrix as any[]) || [],
      }
    : null;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/decisions"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            My Decisions
          </Link>
          <h1 className="text-2xl font-bold">{decision.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-[#00e5c0]/10 text-[#00e5c0] capitalize">
              {decision.category}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(decision.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {analysisData ? (
          <>
            {/* Executive Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#00e5c0]" />
                  <h2 className="font-semibold">Executive Summary</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00e5c0]" />
                  <span className="text-sm text-[#00e5c0] font-medium">
                    {analysisData.confidence}% Confidence
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {analysisData.summary}
              </p>
            </motion.div>

            {/* Recommended Option */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 glow-border"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#00e5c0]" />
                <h2 className="font-semibold text-[#00e5c0]">Recommended Option</h2>
              </div>
              <p className="text-lg font-bold">{analysisData.recommendation}</p>
              <p className="text-sm text-gray-400 mt-2">{analysisData.reasoning}</p>
            </motion.div>

            {/* Options Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-[#a855f7]" />
                <h2 className="font-semibold">Options Comparison</h2>
              </div>

              {analysisData.optionsAnalysis.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-3 text-gray-400 font-medium">Criteria</th>
                        {analysisData.optionsAnalysis.map((opt) => (
                          <th key={opt.option} className="text-center py-2 px-3 font-medium">
                            {opt.option}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(CRITERIA_LABELS).map((criterion) => (
                        <tr key={criterion} className="border-b border-white/5">
                          <td className="py-2 px-3 text-gray-400">{CRITERIA_LABELS[criterion]}</td>
                          {analysisData.optionsAnalysis.map((opt) => {
                            const score = opt.scores[criterion];
                            return (
                              <td key={opt.option} className="py-2 px-3">
                                <ScoreBar score={score} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-3 px-3 text-[#00e5c0]">Total Score</td>
                        {analysisData.optionsAnalysis.map((opt) => (
                          <td key={opt.option} className="py-3 px-3 text-center text-[#00e5c0]">
                            {opt.totalScore.toFixed(1)}/10
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Detailed Breakdown</h2>
              {analysisData.optionsAnalysis.map((opt, i) => (
                <motion.div
                  key={opt.option}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="glass-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedOption(expandedOption === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          i === 0
                            ? "bg-[#00e5c0]/20 text-[#00e5c0]"
                            : "bg-white/5 text-gray-400"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div>
                        <p className="font-medium">{opt.option}</p>
                        <p className="text-xs text-gray-500">{opt.reasoning}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#00e5c0]">
                        {opt.totalScore.toFixed(1)}
                      </span>
                      <TrendingUp
                        className={`w-4 h-4 transition-transform ${
                          expandedOption === i ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {expandedOption === i && (
                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pros
                          </h4>
                          <ul className="space-y-1.5">
                            {opt.pros.map((pro: string, j: number) => (
                              <li key={j} className="text-xs text-gray-400 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Cons
                          </h4>
                          <ul className="space-y-1.5">
                            {opt.cons.map((con: string, j: number) => (
                              <li key={j} className="text-xs text-gray-400 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5">
                        <h4 className="text-sm font-medium mb-3">Score Breakdown</h4>
                        <div className="space-y-2">
                          {Object.entries(opt.scores as Record<string, number>).map(
                            ([key, score]) => (
                              <div key={key} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-32 flex-shrink-0">
                                  {CRITERIA_LABELS[key] || key}
                                </span>
                                <ScoreBar score={score} />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="glass-card p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#00e5c0] mx-auto mb-4" />
            <p className="text-gray-400">Analysis not yet available.</p>
            <p className="text-sm text-gray-500 mt-1">
              The analysis may still be processing or has not been run yet.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
