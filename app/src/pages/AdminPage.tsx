import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  Shield,
  Users,
  MessageSquare,
  Mail,
  Loader2,
  Search,
  Clock,
  CheckCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "contacts">("users");
  const [search, setSearch] = useState("");
  const [userPage] = useState(1);
  const [contactPage] = useState(1);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/dashboard");
      toast.error("Access denied");
    }
  }, [isLoading, isAdmin, navigate]);

  const { data: usersData, isLoading: usersLoading } = trpc.user.list.useQuery(
    { page: userPage, limit: 20, search: search || undefined },
    { enabled: isAdmin },
  );

  const { data: contactsData, isLoading: contactsLoading } =
    trpc.contact.list.useQuery(
      { page: contactPage, limit: 20 },
      { enabled: isAdmin && activeTab === "contacts" },
    );

  const updateRole = trpc.user.updateRole.useMutation({
    onSuccess: () => toast.success("Role updated"),
  });

  const updateContactStatus = trpc.contact.updateStatus.useMutation({
    onSuccess: () => toast.success("Status updated"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00e5c0]" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { id: "users" as const, label: "Users", icon: Users },
    { id: "contacts" as const, label: "Contact Messages", icon: Mail },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-[#00e5c0]" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Users",
                value: usersData?.total || 0,
                icon: Users,
                color: "#00e5c0",
              },
              {
                label: "Contact Messages",
                value: contactsData?.total || 0,
                icon: MessageSquare,
                color: "#a855f7",
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

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#00e5c0] text-[#00e5c0]"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                />
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00e5c0]" />
                </div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Auth Type</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.users.map((user) => (
                        <tr
                          key={`${user.authType}-${user.id}`}
                          className="border-b border-white/5 hover:bg-white/[0.02]"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center text-xs font-bold text-white">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </div>
                              {user.name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400">{user.email || "-"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                user.authType === "oauth"
                                  ? "bg-[#00e5c0]/10 text-[#00e5c0]"
                                  : "bg-[#a855f7]/10 text-[#a855f7]"
                              }`}
                            >
                              {user.authType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                user.role === "admin"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-green-500/10 text-green-400"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                updateRole.mutate({
                                  userId: user.id,
                                  authType: user.authType,
                                  role: user.role === "admin" ? "user" : "admin",
                                })
                              }
                              className="text-xs text-[#00e5c0] hover:underline"
                            >
                              {user.role === "admin" ? "Demote" : "Promote"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && (
            <div>
              {contactsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00e5c0]" />
                </div>
              ) : (
                <div className="space-y-3">
                  {contactsData?.contacts.map((contact) => (
                    <div key={contact.id} className="glass-card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{contact.name}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                              {contact.subject}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                contact.status === "new"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : contact.status === "read"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-green-500/10 text-green-400"
                              }`}
                            >
                              {contact.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{contact.email}</p>
                          <p className="text-sm text-gray-300">{contact.message}</p>
                          <p className="text-[10px] text-gray-600 mt-2">
                            {new Date(contact.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.status === "new" && (
                            <button
                              onClick={() =>
                                updateContactStatus.mutate({
                                  id: contact.id,
                                  status: "read",
                                })
                              }
                              className="p-2 text-gray-500 hover:text-yellow-400 transition-colors"
                              title="Mark as read"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          {contact.status !== "replied" && (
                            <button
                              onClick={() =>
                                updateContactStatus.mutate({
                                  id: contact.id,
                                  status: "replied",
                                })
                              }
                              className="p-2 text-gray-500 hover:text-green-400 transition-colors"
                              title="Mark as replied"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {contactsData?.contacts.length === 0 && (
                    <div className="glass-card p-12 text-center">
                      <Mail className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No contact messages yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
