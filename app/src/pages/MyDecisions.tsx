import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  PlusCircle,
  Search,
  Filter,
  Target,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const STATUS_FILTERS = ["all", "pending", "analyzing", "completed", "accepted", "saved"];

export default function MyDecisions() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = trpc.decision.list.useQuery(
    {
      status: statusFilter === "all" ? undefined : statusFilter,
      page: 1,
      limit: 50,
    },
  );

  const decisions = data?.decisions.filter((d) =>
    search ? d.title.toLowerCase().includes(search.toLowerCase()) : true,
  ) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "accepted":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "analyzing":
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "accepted":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "analyzing":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Decisions</h1>
            <p className="text-sm text-gray-400 mt-1">
              {data?.total || 0} total decisions
            </p>
          </div>
          <Link
            to="/new-decision"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Decision
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search decisions..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
            <Filter className="w-4 h-4 text-gray-500 mr-1 flex-shrink-0" />
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-[#00e5c0]/20 text-[#00e5c0] border border-[#00e5c0]/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#00e5c0]" />
          </div>
        ) : decisions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No decisions found</p>
            <Link to="/new-decision" className="text-sm text-[#00e5c0] hover:underline">
              Create your first decision
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/analysis/${d.id}`}
                  className="flex items-center gap-4 p-4 glass-card group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00e5c0]/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-[#00e5c0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-[#00e5c0] transition-colors">
                      {d.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 capitalize">
                        {d.category}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] border ${getStatusColor(d.status)}`}>
                      {getStatusIcon(d.status)}
                      {d.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#00e5c0] transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
