import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  Brain,
  BarChart3,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  
  ChevronRight,
  
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 150;
    const MOUSE_DIST = 200;
    let mouseX = -1000;
    let mouseY = -1000;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function init() {
      resize();
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
        });
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas!.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.vy *= -1;

        // Draw particle
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(0, 229, 192, 0.3)";
        ctx!.fill();

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(0, 229, 192, ${opacity})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }

        // Mouse interaction
        const mdx = mouseX - p.x;
        const mdy = mouseY - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < MOUSE_DIST) {
          const opacity = (1 - mDist / MOUSE_DIST) * 0.2;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(mouseX, mouseY);
          ctx!.strokeStyle = `rgba(0, 229, 192, ${opacity})`;
          ctx!.lineWidth = 0.5;
          ctx!.stroke();
        }
      }

      animId = requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener("resize", () => {
      resize();
      init();
    });
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

const features = [
  {
    icon: Brain,
    title: "Multi-Perspective Analysis",
    desc: "Evaluate decisions from time, risk, cost, and benefit angles simultaneously using our AI engine.",
    color: "#00e5c0",
  },
  {
    icon: BarChart3,
    title: "Explainable AI",
    desc: "Understand exactly why each recommendation was made with detailed reasoning and trade-off breakdowns.",
    color: "#a855f7",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    desc: "Monitor your decision outcomes, streaks, and improvement over time with rich analytics dashboards.",
    color: "#fb923c",
  },
  {
    icon: Sparkles,
    title: "Adaptive Learning",
    desc: "The system learns from your behavior and adjusts recommendations dynamically based on your patterns.",
    color: "#3b82f6",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    avatar: "/avatar-1.jpg",
    text: "DecisionPilot helped me prioritize feature launches with clear trade-off analysis. The AI recommendations were spot-on and saved me hours of deliberation.",
  },
  {
    name: "Dr. James Wilson",
    role: "Research Director",
    avatar: "/avatar-2.jpg",
    text: "As a researcher, I face complex decisions daily. This tool provides the structured analysis I need to make informed choices about resource allocation.",
  },
  {
    name: "Alex Rivera",
    role: "Software Engineer",
    avatar: "/avatar-3.jpg",
    text: "The adaptive recommendations are incredible. The more I use it, the better it understands my decision-making style and provides tailored insights.",
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#02040a] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <ParticleCanvas />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#02040a]/50 to-[#02040a] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#02040a] via-transparent to-[#02040a]/80 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00e5c0]/10 border border-[#00e5c0]/20 text-[#00e5c0] text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-pulse" />
              AI-Powered Decision Intelligence
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Make Smarter
              <br />
              <span className="text-gradient">Decisions with AI</span>
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
              Analyze trade-offs, evaluate options, and track your progress with an intelligent
              decision assistant that adapts to your needs and profession.
            </p>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(0,229,192,0.3)] transition-all duration-300"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(0,229,192,0.3)] transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/forum"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-all duration-300"
                  >
                    Explore Forum
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {["/avatar-1.jpg", "/avatar-2.jpg", "/avatar-3.jpg"].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-[#02040a] object-cover"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="text-[#00e5c0] font-semibold">2,500+</span> professionals trust DecisionPilot
              </p>
            </div>
          </motion.div>

          {/* Right - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#00e5c0]/20 to-[#a855f7]/20 rounded-2xl blur-2xl" />
              <img
                src="/hero-bg.jpg"
                alt="AI Decision Intelligence"
                className="relative rounded-2xl border border-white/10 shadow-2xl w-full"
              />

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 glass-card p-4 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#00e5c0]" />
                  <span className="text-xs font-medium text-[#00e5c0]">Analysis Complete</span>
                </div>
                <p className="text-xs text-gray-400">Recommended: Focus on high-impact tasks first</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 glass-card p-3"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#a855f7]" />
                  <span className="text-xs text-gray-300">Confidence: 92%</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why <span className="text-gradient">DecisionPilot</span> AI?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI-augmented decision intelligence system goes beyond simple advice to provide
              comprehensive, explainable, and adaptive recommendations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 group"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Three simple steps to smarter decisions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Choose Your Role", desc: "Select your profession to personalize the AI analysis for your specific context." },
              { step: "02", title: "Describe Your Challenge", desc: "Input your goals, constraints, and available options for analysis." },
              { step: "03", title: "Get AI Analysis", desc: "Receive multi-option recommendations with detailed trade-off breakdowns." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00e5c0]/20 to-[#a855f7]/20 border border-[#00e5c0]/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold text-gradient">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full">
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What Our <span className="text-gradient">Users</span> Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <Quote className="w-8 h-8 text-[#00e5c0]/30 mb-4" />
                <p className="text-sm text-gray-300 mb-6 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-elevated rounded-2xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00e5c0]/5 to-[#a855f7]/5" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Make <span className="text-gradient">Smarter Decisions</span>?
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join thousands of professionals using DecisionPilot AI to analyze trade-offs,
                evaluate options, and track their decision-making progress.
              </p>
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(0,229,192,0.3)] transition-all duration-300"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start For Free"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gradient">DECISIONPILOT</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/forum" className="hover:text-[#00e5c0] transition-colors">Forum</Link>
              <Link to="/contact" className="hover:text-[#00e5c0] transition-colors">Contact</Link>
              <Link to="/login" className="hover:text-[#00e5c0] transition-colors">Login</Link>
            </div>
            <p className="text-xs text-gray-600">
              DecisionPilot AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
