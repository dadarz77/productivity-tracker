import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  User,
  Palette,
  Bell,
  
  Save,
  Loader2,
  
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<"profile" | "appearance" | "notifications">("profile");

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => toast.success("Profile updated"),
    onError: () => toast.error("Failed to update profile"),
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({ bio: bio || undefined });
  };

  const sections = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-48 flex-shrink-0">
              <div className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-thin lg:overflow-visible">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                      activeSection === section.id
                        ? "bg-[#00e5c0]/10 text-[#00e5c0]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {activeSection === "profile" && (
                <div className="glass-card p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Profile</h2>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center text-xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all disabled:opacity-50 text-sm"
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}

              {activeSection === "appearance" && (
                <div className="glass-card p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Appearance</h2>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "dark" as const, label: "Dark", desc: "Default dark theme" },
                        { value: "light" as const, label: "Light", desc: "Light theme" },
                        { value: "system" as const, label: "System", desc: "Follow system" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            theme === t.value
                              ? "border-[#00e5c0]/30 bg-[#00e5c0]/5"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                          }`}
                        >
                          <p className="text-sm font-medium">{t.label}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{t.desc}</p>
                          {theme === t.value && (
                            <CheckCircle2 className="w-4 h-4 text-[#00e5c0] mt-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="glass-card p-6 space-y-6">
                  <h2 className="text-lg font-semibold">Notifications</h2>

                  <div className="space-y-4">
                    {[
                      { label: "Decision completed", desc: "Get notified when an analysis is complete" },
                      { label: "Goal reminders", desc: "Weekly reminders for active goals" },
                      { label: "AI insights", desc: "New AI-powered recommendations" },
                    ].map((notif, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]"
                      >
                        <div>
                          <p className="text-sm font-medium">{notif.label}</p>
                          <p className="text-xs text-gray-500">{notif.desc}</p>
                        </div>
                        <div className="w-10 h-6 bg-[#00e5c0]/20 rounded-full relative cursor-pointer">
                          <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-[#00e5c0] rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
