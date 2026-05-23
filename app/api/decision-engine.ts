interface DecisionInput {
  title?: string;
  profession?: string;
  goal: string;
  situation: string;
  availableTime: string;
  resources: string[];
  priorities: string[];
  deadline: string | null;
  stressLevel: number;
  confidenceLevel: number;
  options: string[];
  constraints?: string;
  preferences?: {
    lowRisk?: boolean;
    optimizeSpeed?: boolean;
    longTermImpact?: boolean;
  };
}

interface OptionAnalysis {
  option: string;
  scores: {
    timeEfficiency: number;
    riskLevel: number;
    productivityImpact: number;
    mentalStress: number;
    costResources: number;
    longTermBenefit: number;
    difficulty: number;
    opportunityCost: number;
  };
  totalScore: number;
  pros: string[];
  cons: string[];
  reasoning: string;
}

interface AnalysisResult {
  summary: string;
  confidence: number;
  recommendation: string;
  reasoning: string;
  optionsAnalysis: OptionAnalysis[];
  tradeOffMatrix: {
    criteria: string;
    scores: Record<string, number>;
  }[];
}

function scoreTimeEfficiency(decision: DecisionInput, option: string): number {
  const timeMap: Record<string, number> = {
    "1 day": 1, "3 days": 3, "1 week": 5, "2 weeks": 7, "1 month": 8, "3 months": 9, "6+ months": 10,
  };
  const available = timeMap[decision.availableTime] || 5;
  const urgency = decision.deadline
    ? Math.max(1, 10 - (new Date(decision.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24) / 7)
    : 5;

  const opt = option.toLowerCase();
  let modifier = 1;
  if (opt.includes("quick") || opt.includes("fast") || opt.includes("immediate")) modifier = 1.3;
  if (opt.includes("thorough") || opt.includes("comprehensive") || opt.includes("deep")) modifier = 0.8;

  return Math.min(10, Math.max(1, ((available / Math.max(urgency, 1)) * 5 * modifier)));
}

function scoreRiskLevel(decision: DecisionInput, option: string): number {
  const confidence = decision.confidenceLevel || 5;
  const stress = decision.stressLevel || 5;
  const baseScore = (confidence / Math.max(stress, 1)) * 5;

  const opt = option.toLowerCase();
  let riskModifier = 1;
  if (opt.includes("safe") || opt.includes("conservative") || opt.includes("gradual")) riskModifier = 1.4;
  if (opt.includes("aggressive") || opt.includes("bold") || opt.includes("risky")) riskModifier = 0.7;

  return Math.min(10, Math.max(1, baseScore * riskModifier));
}

function scoreProductivity(decision: DecisionInput, option: string): number {
  const opt = option.toLowerCase();
  let score = 5;
  if (opt.includes("automate") || opt.includes("system") || opt.includes("process")) score = 8;
  if (opt.includes("delegate") || opt.includes("team") || opt.includes("collaborate")) score = 7;
  if (opt.includes("manual") || opt.includes("individual") || opt.includes("alone")) score = 4;
  if (decision.priorities?.includes("quality")) score += 1;
  return Math.min(10, score);
}

function scoreMentalStress(decision: DecisionInput, option: string): number {
  const baseStress = 11 - (decision.stressLevel || 5);
  const opt = option.toLowerCase();
  let modifier = 1;
  if (opt.includes("simple") || opt.includes("easy") || opt.includes("gradual")) modifier = 1.3;
  if (opt.includes("complex") || opt.includes("challenging") || opt.includes("intensive")) modifier = 0.7;
  return Math.min(10, Math.max(1, baseStress * modifier));
}

function scoreCostResources(decision: DecisionInput, option: string): number {
  const resourceCount = decision.resources?.length || 1;
  const baseScore = Math.min(10, resourceCount * 2 + 3);

  const opt = option.toLowerCase();
  if (opt.includes("free") || opt.includes("minimal") || opt.includes("low cost")) return Math.min(10, baseScore + 2);
  if (opt.includes("expensive") || opt.includes("high investment") || opt.includes("premium")) return Math.max(1, baseScore - 2);

  return baseScore;
}

function scoreLongTerm(decision: DecisionInput, option: string): number {
  const opt = option.toLowerCase();
  let score = 5;
  if (opt.includes("learn") || opt.includes("skill") || opt.includes("develop")) score = 8;
  if (opt.includes("invest") || opt.includes("build") || opt.includes("foundation")) score = 9;
  if (opt.includes("quick") || opt.includes("temporary") || opt.includes("shortcut")) score = 3;
  if (decision.preferences?.longTermImpact) score += 1;
  return Math.min(10, score);
}

function scoreDifficulty(decision: DecisionInput, option: string): number {
  const confidence = decision.confidenceLevel || 5;
  const baseScore = confidence;

  const opt = option.toLowerCase();
  if (opt.includes("easy") || opt.includes("simple") || opt.includes("straightforward")) return Math.min(10, baseScore + 2);
  if (opt.includes("hard") || opt.includes("difficult") || opt.includes("complex")) return Math.max(1, baseScore - 2);

  return baseScore;
}

function scoreOpportunityCost(decision: DecisionInput, option: string): number {
  const priorities = decision.priorities || [];
  let score = 5;
  if (priorities.includes("speed")) score += 2;
  if (priorities.includes("quality")) score += 1;
  if (priorities.includes("cost")) score -= 1;
  const opt = option.toLowerCase();
  if (opt.includes("focus") || opt.includes("prioritize") || opt.includes("dedicate")) score += 1;

  return Math.min(10, Math.max(1, score));
}

function generatePros(_decision: DecisionInput, option: string, scores: OptionAnalysis["scores"]): string[] {
  const pros: string[] = [];
  const opt = option.toLowerCase();

  if (scores.timeEfficiency > 7) pros.push("Time-efficient approach for your deadline");
  if (scores.riskLevel > 7) pros.push("Lower risk with your current confidence level");
  if (scores.productivityImpact > 7) pros.push("High productivity impact");
  if (scores.longTermBenefit > 7) pros.push("Strong long-term benefits");
  if (scores.mentalStress > 7) pros.push("Manageable stress level given your situation");
  if (scores.difficulty > 7) pros.push("Aligns well with your skill level");

  if (opt.includes("team")) pros.push("Leverages collaborative strengths");
  if (opt.includes("learn")) pros.push("Builds valuable skills for future decisions");
  if (opt.includes("focus")) pros.push("Clear direction reduces decision fatigue");

  if (pros.length === 0) pros.push("Balanced approach with moderate outcomes");
  return pros;
}

function generateCons(_decision: DecisionInput, option: string, scores: OptionAnalysis["scores"]): string[] {
  const cons: string[] = [];
  const opt = option.toLowerCase();

  if (scores.timeEfficiency < 4) cons.push("May take longer than your timeframe allows");
  if (scores.riskLevel < 4) cons.push("Higher risk given your stress level");
  if (scores.productivityImpact < 4) cons.push("Limited immediate productivity gain");
  if (scores.mentalStress < 4) cons.push("Could increase your stress levels");
  if (scores.costResources < 4) cons.push("Resource-intensive option");
  if (scores.difficulty < 4) cons.push("May be challenging with your current confidence");

  if (opt.includes("aggressive")) cons.push("Requires significant energy investment");
  if (opt.includes("gradual")) cons.push("Results may take longer to materialize");

  if (cons.length === 0) cons.push("No significant drawbacks identified");
  return cons;
}

function generateReasoning(decision: DecisionInput, _option: string, scores: OptionAnalysis["scores"]): string {
  const parts: string[] = [];
  parts.push(`Based on your confidence level (${decision.confidenceLevel}/10) and stress level (${decision.stressLevel}/10)`);

  const topScore = Math.max(...Object.values(scores));
  const topCriteria = Object.entries(scores).find(([, v]) => v === topScore);
  if (topCriteria) {
    parts.push(`this option scores highest on ${topCriteria[0]} (${topScore.toFixed(1)}/10)`);
  }

  if (decision.deadline) {
    const daysLeft = Math.max(0, (new Date(decision.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 7) parts.push("Given the tight deadline, time efficiency is critical");
  }

  return parts.join(", ") + ".";
}

export function analyzeDecision(decision: DecisionInput): AnalysisResult {
  const options = decision.options.length > 0
    ? decision.options
    : ["Option A", "Option B", "Option C"];

  const optionsAnalysis: OptionAnalysis[] = options.map((option) => {
    const scores = {
      timeEfficiency: scoreTimeEfficiency(decision, option),
      riskLevel: scoreRiskLevel(decision, option),
      productivityImpact: scoreProductivity(decision, option),
      mentalStress: scoreMentalStress(decision, option),
      costResources: scoreCostResources(decision, option),
      longTermBenefit: scoreLongTerm(decision, option),
      difficulty: scoreDifficulty(decision, option),
      opportunityCost: scoreOpportunityCost(decision, option),
    };

    const weights = { timeEfficiency: 1.2, riskLevel: 1.1, productivityImpact: 1, mentalStress: 0.9, costResources: 0.8, longTermBenefit: 1.1, difficulty: 0.7, opportunityCost: 1 };
    let weightedSum = 0;
    let weightTotal = 0;
    for (const [key, weight] of Object.entries(weights)) {
      weightedSum += scores[key as keyof typeof scores] * weight;
      weightTotal += weight;
    }
    const totalScore = weightedSum / weightTotal;

    return {
      option,
      scores,
      totalScore,
      pros: generatePros(decision, option, scores),
      cons: generateCons(decision, option, scores),
      reasoning: generateReasoning(decision, option, scores),
    };
  });

  optionsAnalysis.sort((a, b) => b.totalScore - a.totalScore);
  const bestOption = optionsAnalysis[0];

  const criteria = [
    "timeEfficiency", "riskLevel", "productivityImpact", "mentalStress",
    "costResources", "longTermBenefit", "difficulty", "opportunityCost",
  ];

  const tradeOffMatrix = criteria.map((criterion) => ({
    criteria: criterion.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    scores: Object.fromEntries(
      optionsAnalysis.map((o) => [o.option, Math.round(o.scores[criterion as keyof typeof o.scores])]),
    ),
  }));

  const confidence = Math.min(95, Math.max(60, 70 + bestOption.totalScore * 2));

  return {
    summary: `Analysis of "${decision.title || "your decision"}" reveals that **${bestOption.option}** is the optimal choice with a score of ${bestOption.totalScore.toFixed(1)}/10. ${bestOption.reasoning} This recommendation considers your ${decision.profession || "professional"} context and current constraints.`,
    confidence,
    recommendation: bestOption.option,
    reasoning: `The AI recommends "${bestOption.option}" because it achieves the highest weighted score across all evaluation criteria. Key factors: ${bestOption.pros.slice(0, 2).join("; ")}. Your stress level (${decision.stressLevel}/10) and confidence (${decision.confidenceLevel}/10) were primary weighting factors.`,
    optionsAnalysis,
    tradeOffMatrix,
  };
}
