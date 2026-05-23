import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  BarChart3,
  Brain,
  Flame,
  TrendingUp,
  PlusCircle,
  ChevronRight,
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const { data: progress } = trpc.progress.getDashboard.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: decisionList } = trpc.decision.list.useQuery(
    { page: 1, limit: 5 },
    { enabled: isAuthenticated },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00e5c0]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const stats = progress?.stats;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00e5c0]/5 to-[#a855f7]/5" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#00e5c0] animate-pulse" />
                <span className="text-xs text-[#00e5c0] font-medium">System Online</span>
              </div>
              <h1 className="text-2xl font-bold">
                Welcome back, <span className="text-gradient">{user?.name}</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Your decision intelligence dashboard is ready.
              </p>
            </div>
            <Link
              to="/new-decision"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all text-sm whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              New Decision
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Decisions Made",
              value: stats?.totalDecisions || 0,
              icon: BarChart3,
              trend: `+${stats?.completedDecisions || 0} completed`,
              color: "#00e5c0",
            },
            {
              label: "Current Streak",
              value: `${stats?.currentStreak || 0} days`,
              icon: Flame,
              trend: "Keep it up!",
              color: "#fb923c",
            },
            {
              label: "Goal Progress",
              value: `${stats?.goalProgress || 0}%`,
              icon: TrendingUp,
              trend: `${stats?.activeGoals || 0} active goals`,
              color: "#a855f7",
            },
            {
              label: "Completion Rate",
              value: `${stats?.completionRate || 0}%`,
              icon: CheckCircle2,
              trend: "Overall success",
              color: "#3b82f6",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-[#00e5c0]/70 mt-1">{stat.trend}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Decisions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Decisions</h2>
              <Link
                to="/decisions"
                className="text-xs text-[#00e5c0] hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {decisionList && decisionList.decisions.length > 0 ? (
              <div className="space-y-3">
                {decisionList.decisions.map((d) => (
                  <Link
                    key={d.id}
                    to={`/analysis/${d.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#00e5c0]/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-[#00e5c0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{d.category} &middot; {d.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        d.status === "completed" || d.status === "accepted"
                          ? "bg-green-500/10 text-green-400"
                          : d.status === "analyzing"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-gray-500/10 text-gray-400"
                      }`}>
                        {d.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#00e5c0] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-2">No decisions yet</p>
                <Link
                  to="/new-decision"
                  className="text-sm text-[#00e5c0] hover:underline"
                >
                  Create your first decision
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* AI Insights */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-[#00e5c0]" />
                <h3 className="font-semibold">AI Insights</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your decision confidence has been trending upward. Consider using the AI Advisor
                for your next complex challenge.
              </p>
              <Link
                to="/ai-advisor"
                className="inline-flex items-center gap-1 mt-3 text-xs text-[#00e5c0] hover:underline"
              >
                Ask AI Advisor <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Create Decision", path: "/new-decision", icon: PlusCircle },
                  { label: "AI Advisor", path: "/ai-advisor", icon: Sparkles },
                  { label: "View Progress", path: "/progress", icon: TrendingUp },
                ].map((action) => (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all group"
                  >
                    <action.icon className="w-4 h-4 text-gray-500 group-hover:text-[#00e5c0] transition-colors" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Active Goals */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Active Goals</h3>
                <span className="text-xs text-gray-500">{stats?.activeGoals || 0}</span>
              </div>
              {progress?.activeGoals && progress.activeGoals.length > 0 ? (
                <div className="space-y-3">
                  {progress.activeGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">{goal.title}</span>
                        <span className="text-[10px] text-gray-500">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00e5c0] to-[#a855f7] rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No active goals</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
