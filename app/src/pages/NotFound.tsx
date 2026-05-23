import { Link } from "react-router";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00e5c0]/20 to-[#a855f7]/20 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-[#00e5c0]" />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-gradient">404</h1>
        <p className="text-gray-400 mb-8">
          {"This page doesn't exist in your decision matrix."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
