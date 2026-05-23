import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import AppLayout from "@/components/AppLayout";
import {
  Mail,
  Send,
  CheckCircle2,
  ArrowLeft,
  
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createContact = trpc.contact.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent successfully!");
    },
    onError: () => toast.error("Failed to send message"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    createContact.mutate({ name, email, subject, message });
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        {/* Header */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-1">Get in Touch</h1>
          <p className="text-sm text-gray-400 mb-6">
            We&apos;d love to hear from you
          </p>

          {submitted ? (
            <div className="glass-card p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#00e5c0] mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
              <p className="text-sm text-gray-400 mb-6">
                We&apos;ve received your message and will get back to you soon.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg text-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="glass-card p-6 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                  >
                    {["General Inquiry", "Feature Request", "Bug Report", "Partnership"].map(
                      (s) => (
                        <option key={s} value={s} className="bg-[#0a0f1a]">
                          {s}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message *</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    rows={5}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createContact.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {createContact.isPending ? "Sending..." : "Send Message"}
                </button>
              </form>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span>support@decisionpilot.ai</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                  <Clock className="w-4 h-4" />
                  <span>Usually responds within 24 hours</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
