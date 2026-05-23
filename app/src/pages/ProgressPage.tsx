import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  Flame,
  Target,
  Award,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ["#00e5c0", "#a855f7", "#fb923c", "#3b82f6", "#f472b6"];

const BADGE_ICONS: Record<string, typeof Award> = {
  first_decision: Target,
  seven_streak: Flame,
  deep_analyzer: BarChart3,
  goal_crusher: CheckCircle2,
  ai_explorer: TrendingUp,
  community_voice: Award,
};

export default function ProgressPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  const { data: dashboard } = trpc.progress.getDashboard.useQuery();
  const { data: chartData } = trpc.progress.getChartData.useQuery({ range });
  const { data: achievements } = trpc.progress.getAchievements.useQuery();

  const stats = dashboard?.stats;

  const ranges: { value: "7d" | "30d" | "90d" | "all"; label: string }[] = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "all", label: "All Time" },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Your Decision Journey</h1>
            <p className="text-sm text-gray-400 mt-1">Track your progress over time</p>
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  range === r.value
                    ? "bg-[#00e5c0]/20 text-[#00e5c0]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Decisions",
              value: stats?.totalDecisions || 0,
              icon: BarChart3,
              color: "#00e5c0",
            },
            {
              label: "Completion Rate",
              value: `${stats?.completionRate || 0}%`,
              icon: Target,
              color: "#a855f7",
            },
            {
              label: "Current Streak",
              value: `${stats?.currentStreak || 0} days`,
              icon: Flame,
              color: "#fb923c",
            },
            {
              label: "Goals Completed",
              value: stats?.completedGoals || 0,
              icon: CheckCircle2,
              color: "#3b82f6",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-5"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold mb-4">Decision Activity</h3>
            {chartData?.activity && chartData.activity.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0a0f1a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="decisions" fill="#00e5c0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                No activity data yet
              </div>
            )}
          </motion.div>

          {/* Outcome Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold mb-4">Outcome Distribution</h3>
            {chartData?.outcomes && chartData.outcomes.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData.outcomes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.outcomes.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0a0f1a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                No outcome data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-[#fb923c]" />
            <h3 className="font-semibold">Achievements</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements?.map((badge) => {
              const IconComp = BADGE_ICONS[badge.id] || Award;
              return (
                <div
                  key={badge.id}
                  className={`text-center p-4 rounded-xl border transition-all ${
                    badge.unlocked
                      ? "bg-[#00e5c0]/5 border-[#00e5c0]/20"
                      : "bg-white/[0.02] border-white/5 opacity-40"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                      badge.unlocked ? "bg-[#00e5c0]/10" : "bg-white/5"
                    }`}
                  >
                    <IconComp
                      className={`w-6 h-6 ${badge.unlocked ? "text-[#00e5c0]" : "text-gray-600"}`}
                    />
                  </div>
                  <p className="text-xs font-medium">{badge.name}</p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
