import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Loader2,
  Sparkles,
  Lightbulb,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const TIME_OPTIONS = ["1 day", "3 days", "1 week", "2 weeks", "1 month", "3 months", "6+ months"];
const RESOURCE_OPTIONS = ["Money", "Time", "People", "Tools", "Information", "Network"];
const PRIORITY_OPTIONS = ["Speed", "Quality", "Cost", "Learning", "Safety", "Innovation"];

export default function NewDecision() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [situation, setSituation] = useState("");
  const [availableTime, setAvailableTime] = useState("1 week");
  const [resources, setResources] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [constraints, setConstraints] = useState("");
  const [lowRisk, setLowRisk] = useState(false);
  const [optimizeSpeed, setOptimizeSpeed] = useState(false);
  const [longTermImpact, setLongTermImpact] = useState(false);
  const [category, setCategory] = useState("general");

  const createMutation = trpc.decision.create.useMutation();
  const analyzeMutation = trpc.analysis.create.useMutation();

  const toggleResource = (r: string) => {
    setResources((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  };

  const togglePriority = (p: string) => {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return options.every((o) => o.trim().length > 0);
    return true;
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await createMutation.mutateAsync({
        title,
        goal,
        situation,
        availableTime,
        resources,
        priorities,
        deadline: deadline || null,
        stressLevel,
        confidenceLevel,
        options: options.filter((o) => o.trim()),
        constraints,
        preferences: { lowRisk, optimizeSpeed, longTermImpact },
        category,
      });

      toast.success("Decision created! Running AI analysis...");

      // Run analysis
      await analyzeMutation.mutateAsync({ decisionId: result.id });

      toast.success("Analysis complete!");
      navigate(`/analysis/${result.id}`);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setIsAnalyzing(false);
    }
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <AppLayout>
      {isAnalyzing ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <svg className="w-full h-full animate-spin-slow" viewBox="0 0 48 48">
                <rect
                  x="6" y="6" width="36" height="36" rx="4"
                  fill="none" stroke="#a855f7" strokeWidth="2"
                  strokeDasharray="8 4" transform="rotate(45 24 24)"
                />
              </svg>
              <svg className="absolute inset-2 w-20 h-20 animate-spin-reverse" viewBox="0 0 48 48">
                <rect
                  x="14" y="14" width="20" height="20" rx="2"
                  fill="none" stroke="#00e5c0" strokeWidth="2"
                  strokeDasharray="6 4" transform="rotate(45 24 24)"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Analyzing Your Decision</h2>
            <p className="text-sm text-gray-400">Evaluating trade-offs and generating recommendations...</p>
          </motion.div>
        </div>
      ) : (
        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate("/dashboard")}
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {step > 1 ? "Back" : "Dashboard"}
            </button>
            <h1 className="text-2xl font-bold">Create New Decision</h1>
            <p className="text-sm text-gray-400 mt-1">
              Describe your situation and let AI analyze your options
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    s === step
                      ? "bg-[#00e5c0] text-[#02040a]"
                      : s < step
                      ? "bg-[#00e5c0]/20 text-[#00e5c0]"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className={`text-xs ${s === step ? "text-white" : "text-gray-600"}`}>
                  {s === 1 ? "Context" : "Options & Constraints"}
                </span>
                {s === 1 && <div className="flex-1 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Target className="w-4 h-4 text-[#00e5c0]" />
                    Decision Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Should I switch careers?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                  >
                    {["general", "career", "education", "finance", "health", "business", "personal"].map((c) => (
                      <option key={c} value={c} className="bg-[#0a0f1a]">
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Goal */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Lightbulb className="w-4 h-4 text-[#a855f7]" />
                    What do you want to achieve?
                  </label>
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Describe your primary goal..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all resize-none"
                  />
                </div>

                {/* Situation */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Situation</label>
                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="Describe your current challenges and context..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all resize-none"
                  />
                </div>

                {/* Time & Deadline */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Clock className="w-4 h-4 text-[#fb923c]" />
                      Available Time
                    </label>
                    <select
                      value={availableTime}
                      onChange={(e) => setAvailableTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t} className="bg-[#0a0f1a]">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Deadline</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                    />
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Available Resources</label>
                  <div className="flex flex-wrap gap-2">
                    {RESOURCE_OPTIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleResource(r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          resources.includes(r)
                            ? "bg-[#00e5c0]/20 text-[#00e5c0] border border-[#00e5c0]/30"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priorities */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Priorities</label>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITY_OPTIONS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePriority(p)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          priorities.includes(p)
                            ? "bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        Stress Level
                      </span>
                      <span className="text-[#00e5c0] font-bold">{stressLevel}/10</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={stressLevel}
                      onChange={(e) => setStressLevel(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00e5c0]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                      <span>Calm</span>
                      <span>Stressed</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Confidence Level
                      </span>
                      <span className="text-[#00e5c0] font-bold">{confidenceLevel}/10</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={confidenceLevel}
                      onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00e5c0]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                      <span>Unsure</span>
                      <span>Confident</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Options */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Sparkles className="w-4 h-4 text-[#00e5c0]" />
                    What options are you considering?
                  </label>
                  <div className="space-y-2">
                    {options.map((option, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + i)}: e.g., Switch to new job`}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="p-3 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="inline-flex items-center gap-1 text-sm text-[#00e5c0] hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Add another option
                    </button>
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Constraints or Limitations</label>
                  <textarea
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="Any constraints we should consider? (budget, time, resources...)"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all resize-none"
                  />
                </div>

                {/* Preferences */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Preferences</label>
                  <div className="space-y-2">
                    {[
                      { label: "Prefer low-risk options", state: lowRisk, set: setLowRisk },
                      { label: "Optimize for speed", state: optimizeSpeed, set: setOptimizeSpeed },
                      { label: "Consider long-term impact", state: longTermImpact, set: setLongTermImpact },
                    ].map((pref) => (
                      <button
                        key={pref.label}
                        type="button"
                        onClick={() => pref.set(!pref.state)}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all text-left ${
                          pref.state
                            ? "bg-[#00e5c0]/5 border-[#00e5c0]/30"
                            : "bg-white/[0.02] border-white/10 hover:bg-white/5"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            pref.state
                              ? "bg-[#00e5c0] border-[#00e5c0]"
                              : "border-gray-600"
                          }`}
                        >
                          {pref.state && <CheckCircle2 className="w-3 h-3 text-[#02040a]" />}
                        </div>
                        <span className="text-sm">{pref.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              className={`px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors ${
                step === 1 ? "invisible" : ""
              }`}
            >
              Previous
            </button>

            {step === 1 ? (
              <button
                onClick={() => canProceed() && setStep(2)}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!canProceed() || createMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Analyze Decision
              </button>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
