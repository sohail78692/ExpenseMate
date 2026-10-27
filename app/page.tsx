"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GooeyNav from "@/components/GooeyNav";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Target,
  CreditCard,
  Calendar,
  ChevronDown,
  Star,
  Menu,
  X,
  ArrowUpRight,
  Sliders,
  ShoppingBag,
  Coffee,
  Home,
  Car,
  Laptop
} from "lucide-react";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero interactive showcase active tab
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<"feed" | "budgets" | "heatmap">("feed");

  // Interactive calculator state
  const [monthlyIncome, setMonthlyIncome] = useState<number>(4500);
  const [monthlySpend, setMonthlySpend] = useState<number>(1800);

  // FAQ open item
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-[#0A84FF]/20 animate-ping"></div>
            <div className="w-14 h-14 rounded-full border-2 border-[#0A84FF] border-t-transparent animate-spin"></div>
          </div>
          <p className="text-zinc-400 text-xs font-medium tracking-wide">Loading ExpenseMate...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  // Calculated values for dynamic calculator
  const monthlySavings = Math.round(monthlySpend * 0.18);
  const yearlySavings = monthlySavings * 12;
  const fiveYearInvested = Math.round(yearlySavings * 5 * 1.28);

  const faqItems = [
    {
      q: "Is ExpenseMate completely free to use?",
      a: "Yes! ExpenseMate offers a full-featured free experience with no hidden paywalls, zero ads, and no required credit cards to sign up."
    },
    {
      q: "How does ExpenseMate protect my financial privacy?",
      a: "We adopt Apple-grade privacy standards. Your data is encrypted with modern cryptography, isolated to your account, and never sold to third-party data brokers."
    },
    {
      q: "Can I set custom budget categories and limits?",
      a: "Yes. You can customize monthly spending targets for categories like Groceries, Dining, Housing, Utilities, Subscriptions, and more. Visual progress rings notify you before you overspend."
    },
    {
      q: "Does it work seamlessly on mobile browsers?",
      a: "ExpenseMate is built with a responsive iOS-first design system. You get a native app feel on iPhone Safari, iPad, Android, and Mac desktop browsers."
    },
    {
      q: "Can I export my financial reports?",
      a: "Yes, you can export your expense logs and analytics summaries to CSV formats anytime for tax season, personal spreadsheets, or backup."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0A84FF] selection:text-white font-sans antialiased overflow-x-hidden scroll-smooth">
      {/* iOS Ambient Lighting Glows (Apple Intelligence spectrum: Cyan, Blue, Indigo) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#0A84FF]/18 via-[#5E5CE6]/10 to-transparent blur-[130px] rounded-full"></div>
        <div className="absolute top-[35%] -left-48 w-[550px] h-[550px] bg-[#64D2FF]/10 blur-[140px] rounded-full"></div>
        <div className="absolute top-[60%] -right-48 w-[550px] h-[550px] bg-[#0A84FF]/10 blur-[140px] rounded-full"></div>
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* TOP NAVIGATION BAR - FLOATING ISLAND (iOS Style) */}
      <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none transition-all">
        <div className="w-full max-w-6xl backdrop-blur-2xl bg-[#121214]/85 border border-white/[0.12] rounded-2xl sm:rounded-full px-4 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between shadow-2xl shadow-black/60 pointer-events-auto transition-all">
          {/* Brand Identity - Clean Apple-style Typographic Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF] rounded-full">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#0071E3] to-[#64D2FF] flex items-center justify-center text-white shadow-md shadow-[#0071E3]/25 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              Expense<span className="text-[#0A84FF]">Mate</span>
            </span>
          </Link>

          {/* Desktop GooeyNav Navigation - iOS Theme */}
          <div className="hidden md:flex items-center justify-center">
            <GooeyNav
              items={[
                { label: 'Features', href: '#features' },
                { label: 'Preview', href: '#showcase' },
                { label: 'Calculator', href: '#calculator' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'FAQ', href: '#faq' }
              ]}
              initialActiveIndex={0}
              theme="dark"
              size="sm"
              color="#0A84FF"
              colors={['#0A84FF', '#5E5CE6', '#64D2FF', '#30D158']}
              particleCount={15}
              spread={46}
              animationTime={580}
              timeVariance={280}
              gooeyness={0.55}
              wobble={0.45}
              hoverEffect={true}
            />
          </div>

          {/* Action Buttons - Apple Pill Style */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-zinc-300 hover:text-white hover:bg-white/[0.08] text-xs sm:text-sm font-medium px-3.5 h-8 sm:h-9 rounded-full transition-colors"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                className="bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-medium px-4 sm:px-5 h-8 sm:h-9 rounded-full text-xs sm:text-sm shadow-md shadow-[#0071E3]/25 hover:shadow-[#0071E3]/40 transition-all"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown - Floating Card below Island */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-4 right-4 max-w-6xl mx-auto md:hidden rounded-2xl border border-white/[0.1] bg-[#121214]/95 backdrop-blur-2xl p-5 space-y-3 shadow-2xl shadow-black/80 pointer-events-auto animate-in slide-in-from-top-2 duration-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-200 hover:text-white font-medium py-2 text-sm px-2 rounded-lg hover:bg-white/[0.05]"
            >
              Features
            </a>
            <a
              href="#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-200 hover:text-white font-medium py-2 text-sm px-2 rounded-lg hover:bg-white/[0.05]"
            >
              App Preview
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-200 hover:text-white font-medium py-2 text-sm px-2 rounded-lg hover:bg-white/[0.05]"
            >
              Savings Calculator
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-200 hover:text-white font-medium py-2 text-sm px-2 rounded-lg hover:bg-white/[0.05]"
            >
              How It Works
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-zinc-200 hover:text-white font-medium py-2 text-sm px-2 rounded-lg hover:bg-white/[0.05]"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center rounded-full border-white/20 text-white hover:bg-white/10 text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 pt-24 sm:pt-28">
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl">
            {/* Apple Intelligence Style Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs sm:text-sm font-medium mb-8 backdrop-blur-xl shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-[#30D158] animate-pulse"></span>
              <span className="text-[#64D2FF] font-semibold">Intelligent Finance</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300 font-normal">Track, budget and save with native precision</span>
            </div>

            {/* Master Headline - Apple Keynote Aesthetic */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Master your money with{" "}
              <span className="bg-gradient-to-r from-[#2997FF] via-[#70B4FF] to-[#A1D2FF] bg-clip-text text-transparent">
                effortless clarity.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-zinc-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              Stop wondering where your paycheck went. ExpenseMate transforms daily spending into actionable intelligence with smart category heatmaps, real-time budget guardrails, and automated savings targets.
            </p>

            {/* CTA Group - Apple Pill Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold px-8 py-6 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-xl shadow-[#0071E3]/25 hover:shadow-[#0071E3]/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-cyan-200" />
                  Start Tracking Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#showcase" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base font-medium px-8 py-6 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white backdrop-blur-xl transition-all"
                >
                  Explore Interactive Demo
                </Button>
              </a>
            </div>

            {/* Value badges / Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                <span>100% Free & Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                <span>Apple-Grade Privacy & Encryption</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE SHOWCASE DEMO (iPadOS / macOS Widget Window) */}
          <div id="showcase" className="scroll-mt-28 mt-14 sm:mt-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="relative rounded-[32px] p-1 bg-gradient-to-b from-white/20 via-white/[0.05] to-transparent shadow-2xl shadow-blue-950/40">
              <div className="relative rounded-[28px] bg-[#121214] border border-white/[0.08] overflow-hidden backdrop-blur-2xl">
                {/* macOS Style Window Top Bar */}
                <div className="px-5 py-4 bg-[#18181b]/90 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                    <span className="ml-3 text-xs font-mono text-zinc-400 hidden sm:inline">
                      ExpenseMate • iOS & macOS Financial Workspace
                    </span>
                  </div>

                  {/* iOS Segmented Control Tab Switcher */}
                  <div className="flex items-center bg-[#242426] p-1 rounded-full border border-white/[0.08] text-xs">
                    <button
                      onClick={() => setActiveShowcaseTab("feed")}
                      className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                        activeShowcaseTab === "feed"
                          ? "bg-[#0A84FF] text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Recent Feed
                    </button>
                    <button
                      onClick={() => setActiveShowcaseTab("budgets")}
                      className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                        activeShowcaseTab === "budgets"
                          ? "bg-[#0A84FF] text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Budget Rings
                    </button>
                    <button
                      onClick={() => setActiveShowcaseTab("heatmap")}
                      className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                        activeShowcaseTab === "heatmap"
                          ? "bg-[#0A84FF] text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Activity Heatmap
                    </button>
                  </div>
                </div>

                {/* Inner Apple Wallet / Dashboard Content */}
                <div className="p-6 sm:p-8">
                  {/* Top Stats Cards - iOS Widget Aesthetic */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] hover:border-[#0A84FF]/40 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-medium">Total Balance</span>
                        <span className="text-xs text-[#30D158] font-semibold flex items-center gap-1">
                          +14.8% <TrendingUp className="w-3 h-3" />
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">$14,850.40</div>
                      <div className="text-[11px] text-zinc-500 mt-1">Across 3 connected cards</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] hover:border-[#0A84FF]/40 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-medium">This Month&apos;s Spend</span>
                        <span className="text-xs text-[#0A84FF] font-semibold">On Track</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">$2,180.20</div>
                      <div className="text-[11px] text-zinc-500 mt-1">$819.80 remaining of $3,000 budget</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/[0.06] hover:border-[#0A84FF]/40 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-400 font-medium">Emergency Fund Goal</span>
                        <span className="text-xs text-[#64D2FF] font-semibold">85% Complete</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">$8,500.00</div>
                      <div className="text-[11px] text-zinc-500 mt-1">Target: $10,000 (Target: Nov 2026)</div>
                    </div>
                  </div>

                  {/* Dynamic Tab Panes */}
                  {activeShowcaseTab === "feed" && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        <span>Description</span>
                        <span>Category</span>
                        <span>Date</span>
                        <span className="text-right">Amount</span>
                      </div>

                      {[
                        { icon: ShoppingBag, name: "Whole Foods Market", cat: "Groceries", color: "text-[#30D158] bg-[#30D158]/15", date: "Today, 2:15 PM", amount: "-$64.50" },
                        { icon: Laptop, name: "Apple One Premier Subscription", cat: "Subscriptions", color: "text-[#0A84FF] bg-[#0A84FF]/15", date: "Yesterday", amount: "-$37.95" },
                        { icon: Coffee, name: "Blue Bottle Coffee", cat: "Dining", color: "text-[#FF9F0A] bg-[#FF9F0A]/15", date: "Oct 25, 2026", amount: "-$8.75" },
                        { icon: Home, name: "Smart Utility & Water", cat: "Utilities", color: "text-[#5E5CE6] bg-[#5E5CE6]/15", date: "Oct 24, 2026", amount: "-$124.00" },
                        { icon: Car, name: "EV Fast Charger", cat: "Transport", color: "text-[#64D2FF] bg-[#64D2FF]/15", date: "Oct 22, 2026", amount: "-$28.40" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1c1c1e] hover:bg-[#252528] border border-white/[0.04] transition-all"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`p-2 rounded-xl ${item.color}`}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-white">{item.name}</span>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-white/[0.06] text-zinc-300 font-medium hidden sm:inline">
                            {item.cat}
                          </span>
                          <span className="text-xs text-zinc-400 hidden sm:inline">{item.date}</span>
                          <span className="text-sm font-semibold text-white font-mono">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeShowcaseTab === "budgets" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {[
                        { category: "Groceries & Food", spent: 480, total: 600, pct: 80, color: "bg-[#30D158]" },
                        { category: "Dining Out & Coffee", spent: 210, total: 250, pct: 84, color: "bg-[#FF9F0A]" },
                        { category: "Entertainment & Streaming", spent: 95, total: 150, pct: 63, color: "bg-[#0A84FF]" },
                        { category: "Transportation & EV", spent: 180, total: 300, pct: 60, color: "bg-[#64D2FF]" },
                        { category: "Health & Fitness", spent: 140, total: 200, pct: 70, color: "bg-[#FF375F]" },
                      ].map((b, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#1c1c1e] border border-white/[0.05]">
                          <div className="flex justify-between items-center text-sm mb-2.5">
                            <span className="font-medium text-white">{b.category}</span>
                            <span className="text-xs text-zinc-400">
                              <span className="text-white font-semibold">${b.spent}</span> of ${b.total} ({b.pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${b.color} transition-all duration-1000`}
                              style={{ width: `${b.pct}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeShowcaseTab === "heatmap" && (
                    <div className="animate-in fade-in duration-300">
                      <div className="text-sm font-medium text-zinc-300 mb-4 flex items-center justify-between">
                        <span>Daily Spending Intensity (Current Month)</span>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <span>Low</span>
                          <span className="w-3 h-3 rounded bg-white/10"></span>
                          <span className="w-3 h-3 rounded bg-[#0A84FF]/40"></span>
                          <span className="w-3 h-3 rounded bg-[#0A84FF]/75"></span>
                          <span className="w-3 h-3 rounded bg-[#0A84FF]"></span>
                          <span>High</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }).map((_, i) => {
                          const intensity = [0, 1, 2, 3, 1, 0, 2, 3, 0, 1, 2, 1, 3, 2, 0, 1, 2, 3, 0, 1, 0, 2, 3, 1, 0, 2, 1, 3, 2, 1, 0][i];
                          const colors = ["bg-white/[0.04]", "bg-[#0A84FF]/25 border-[#0A84FF]/30", "bg-[#0A84FF]/60", "bg-[#0A84FF] text-white font-bold"];
                          return (
                            <div
                              key={i}
                              className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center border border-white/[0.05] ${colors[intensity]} hover:scale-105 transition-transform cursor-pointer`}
                              title={`Day ${i + 1}: Expense tracked`}
                            >
                              <span className="text-[10px] text-zinc-400">{i + 1}</span>
                              <span className="text-[11px] font-semibold text-white">
                                {intensity === 0 ? "$0" : `$${(intensity * 38).toFixed(0)}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* iOS Live Activity / Notification Style Floating Micro-cards */}
              <div className="hidden lg:flex absolute -bottom-6 -left-6 p-4 rounded-2xl ios-glass border border-white/10 shadow-2xl items-center gap-3 animate-float-slow">
                <div className="w-10 h-10 rounded-xl bg-[#30D158]/20 text-[#30D158] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Smart Budget Notification</div>
                  <div className="text-[11px] text-zinc-300">You saved $140 on dining this week!</div>
                </div>
              </div>

              <div className="hidden lg:flex absolute -top-6 -right-6 p-4 rounded-2xl ios-glass border border-white/10 shadow-2xl items-center gap-3 animate-float-delayed">
                <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Target In Reach</div>
                  <div className="text-[11px] text-zinc-300">Emergency fund reaches 85% completion</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS & CREDIBILITY BANNER - Clean Minimalist Apple Strip */}
        <section className="py-12 border-y border-white/[0.08] bg-[#0c0c0e]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">$3.2M+</div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">Expenses Tracked Safely</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#0A84FF] tracking-tight">15,000+</div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">Active Budget Savers</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#64D2FF] tracking-tight">4.9 / 5.0</div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">App Store Rating Equivalent</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#30D158] tracking-tight">100%</div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">Free & Private</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION - iOS SQUIRCLE CARDS */}
        <section id="features" className="scroll-mt-28 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-[#0A84FF] mb-4">
                <Zap className="w-3.5 h-3.5" />
                <span>Engineered for Pure Performance</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                Everything you need to master your cash flow.
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                No clunky spreadsheets. No steep learning curves. Just simple, beautiful tools that give you immediate control over your finances.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-8 rounded-[28px] ios-card group">
                <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/25 text-[#0A84FF] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Frictionless Logging</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Log transactions in under 5 seconds with custom tags, categorized receipts, notes, and multi-currency entry.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-[28px] ios-card group">
                <div className="w-12 h-12 rounded-2xl bg-[#5E5CE6]/15 border border-[#5E5CE6]/25 text-[#5E5CE6] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Dynamic Analytics</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Understand your spending distribution with interactive pie charts, daily velocity curves, and monthly comparisons.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-[28px] ios-card group">
                <div className="w-12 h-12 rounded-2xl bg-[#FF375F]/15 border border-[#FF375F]/25 text-[#FF375F] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Budget Guardrails</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Set monthly category budgets and receive proactive visual notifications before overspending on dining or shopping.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-[28px] ios-card group">
                <div className="w-12 h-12 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/25 text-[#30D158] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Milestone Goals</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Target milestones like vacations, emergency funds, or investments with automated progress tracking and target dates.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-[28px] ios-card group">
                <div className="w-12 h-12 rounded-2xl bg-[#FF9F0A]/15 border border-[#FF9F0A]/25 text-[#FF9F0A] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Activity Heatmaps</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Spot habits at a glance. Identify high-intensity spending days and weekends using our monthly visual heatmap grid.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-[28px] ios-card group">
                <div className="w-12 h-12 rounded-2xl bg-[#64D2FF]/15 border border-[#64D2FF]/25 text-[#64D2FF] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Hardware-Grade Privacy</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  End-to-end encrypted sessions and authenticated database security. Your transactions are completely private to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SAVINGS CALCULATOR SECTION */}
        <section id="calculator" className="scroll-mt-28 py-20 bg-[#0d0d10] border-y border-white/[0.08]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 text-xs font-semibold text-[#30D158] mb-3">
                <Sliders className="w-3.5 h-3.5" />
                <span>Interactive Projection</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                See how much ExpenseMate could save you.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">
                Studies show mindful budget tracking eliminates 15% to 20% of discretionary spending leaks in the very first month.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#161618] p-6 sm:p-10 rounded-[32px] border border-white/[0.08] shadow-2xl">
              {/* Sliders Area - iOS Settings Feel */}
              <div className="md:col-span-7 space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-zinc-300">Monthly Net Income</label>
                    <span className="text-lg font-bold text-white font-mono">${monthlyIncome.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="15000"
                    step="250"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                    <span>$1,500</span>
                    <span>$15,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-zinc-300">Monthly Discretionary Spending (Dining, Shopping, Subs)</label>
                    <span className="text-lg font-bold text-white font-mono">${monthlySpend.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="6000"
                    step="100"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                    <span>$300</span>
                    <span>$6,000</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#0A84FF] mt-0.5 shrink-0" />
                  <span>
                    By cutting unnoticed subscription duplicates and setting budget caps, ExpenseMate users save an average of 18% on discretionary purchases.
                  </span>
                </div>
              </div>

              {/* Projected Result Card - Apple Card Aesthetic */}
              <div className="md:col-span-5 p-7 rounded-[26px] bg-gradient-to-br from-[#0A84FF]/20 via-[#5E5CE6]/10 to-transparent border border-[#0A84FF]/30 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64D2FF]">Projected Savings</span>
                <div className="text-4xl sm:text-5xl font-bold text-white mt-2 mb-1 tracking-tight font-mono">
                  ${monthlySavings.toLocaleString()}
                  <span className="text-lg text-zinc-400 font-normal"> /mo</span>
                </div>
                <div className="text-sm font-medium text-[#30D158] mb-6">
                  ~${yearlySavings.toLocaleString()} saved in your first year
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2 text-left text-xs mb-6">
                  <div className="flex justify-between text-zinc-300">
                    <span>5-Year Compound Growth:</span>
                    <span className="text-white font-semibold">${fiveYearInvested.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Setup Time:</span>
                    <span className="text-[#30D158] font-semibold">Under 2 minutes</span>
                  </div>
                </div>

                <Link href="/register">
                  <Button className="w-full rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-5 shadow-lg shadow-[#0071E3]/30">
                    Start Saving Now
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="scroll-mt-28 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Three simple steps to total financial clarity.
              </h2>
              <p className="text-zinc-400 text-base">
                No complex banking credentials or lengthy spreadsheets. Get rolling in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="p-7 rounded-[26px] ios-card relative">
                <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 text-[#0A84FF] font-bold flex items-center justify-center mb-5 border border-[#0A84FF]/30">
                  1
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Create Your Space</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Sign up in 30 seconds with email verification. No credit card, no intrusive permissions.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-7 rounded-[26px] ios-card relative">
                <div className="w-10 h-10 rounded-full bg-[#5E5CE6]/20 text-[#5E5CE6] font-bold flex items-center justify-center mb-5 border border-[#5E5CE6]/30">
                  2
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Set Budgets & Log</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Set comfortable category limits and log expenses on the go with one-tap quick add.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-7 rounded-[26px] ios-card relative">
                <div className="w-10 h-10 rounded-full bg-[#30D158]/20 text-[#30D158] font-bold flex items-center justify-center mb-5 border border-[#30D158]/30">
                  3
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Watch Savings Grow</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Review visual insights, adjust spending before overages, and celebrate your savings milestones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 bg-[#0d0d10] border-t border-white/[0.08]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="flex justify-center gap-1 text-[#FFBD2E] mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFBD2E]" />
                ))}
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Loved by over 15,000 budgeters</h2>
              <p className="text-zinc-400 text-sm">Here is what our community says about ExpenseMate.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "ExpenseMate transformed my chaotic monthly budget. The visual calendar heatmap makes it instantly obvious when I am overspending on weekends.",
                  author: "Elena Rostova",
                  role: "Product Designer",
                  saved: "Saved $450/mo"
                },
                {
                  quote: "Clean, ultra-fast, and zero fluff. The category budget progress bars keep me disciplined without feeling restrictive.",
                  author: "Marcus Chen",
                  role: "Software Engineer",
                  saved: "Saved $620/mo"
                },
                {
                  quote: "Finally an expense app that doesn't bombard me with credit card ads or demand linking my bank accounts. Completely private and beautiful.",
                  author: "Sarah Jenkins",
                  role: "Independent Creator",
                  saved: "Saved $310/mo"
                }
              ].map((t, idx) => (
                <div key={idx} className="p-7 rounded-[26px] ios-card flex flex-col justify-between">
                  <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <div>
                      <div className="font-semibold text-white text-sm">{t.author}</div>
                      <div className="text-xs text-zinc-400">{t.role}</div>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/20">
                      {t.saved}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION - iOS Inset Grouped List Style */}
        <section id="faq" className="scroll-mt-28 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">
                Everything you need to know about ExpenseMate and getting started.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/[0.08] bg-[#161618] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left font-semibold text-white flex items-center justify-between gap-4 focus:outline-none"
                    >
                      <span className="text-base">{item.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? "rotate-180 text-[#0A84FF]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-zinc-300 text-sm leading-relaxed animate-in fade-in duration-200 border-t border-white/[0.04] pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* GRAND FINALE CALL TO ACTION - Apple Intelligence Glow */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="relative rounded-[36px] p-8 sm:p-14 bg-gradient-to-r from-[#0A84FF]/25 via-[#5E5CE6]/20 to-[#64D2FF]/20 border border-white/[0.12] overflow-hidden text-center shadow-2xl">
              {/* Radial backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0A84FF]/20 via-transparent to-transparent"></div>

              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-white mb-6 backdrop-blur-xl">
                  <Sparkles className="w-3.5 h-3.5 text-[#64D2FF]" />
                  <span>Take command of your wealth</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                  Ready to stop stressing over money?
                </h2>
                <p className="text-zinc-200 text-base sm:text-lg mb-8 leading-relaxed">
                  Join thousands taking control of their cash flow with ExpenseMate. Free forever, setup in 30 seconds.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto px-10 py-6 text-base font-bold rounded-full bg-white text-black hover:bg-zinc-100 shadow-xl hover:scale-105 transition-all"
                    >
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto px-8 py-6 text-base font-medium rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all"
                    >
                      Sign In Instead
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MINIMALIST APPLE FOOTER */}
      <footer className="border-t border-white/[0.08] bg-black py-14 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Identity */}
            <div className="md:col-span-1 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0071E3] to-[#64D2FF] flex items-center justify-center text-white shadow-sm">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">
                  Expense<span className="text-[#0A84FF]">Mate</span>
                </span>
              </Link>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Smart personal expense tracker engineered for total financial clarity and proactive savings.
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-[#30D158] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse"></span>
                <span>All systems operational</span>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#showcase" className="hover:text-white transition-colors">Interactive Demo</a></li>
                <li><a href="#calculator" className="hover:text-white transition-colors">Savings Calculator</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Column 3: Management */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Finances</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/expenses" className="hover:text-white transition-colors">Expense Tracking</Link></li>
                <li><Link href="/analytics" className="hover:text-white transition-colors">Visual Analytics</Link></li>
                <li><Link href="/budgets" className="hover:text-white transition-colors">Budget Limits</Link></li>
                <li><Link href="/savings" className="hover:text-white transition-colors">Savings Goals</Link></li>
              </ul>
            </div>

            {/* Column 4: Account & Security */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Account</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register Free</Link></li>
                <li><a href="https://github.com/sohail78692/ExpenseMate" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">GitHub Repository <ArrowUpRight className="w-3.5 h-3.5" /></a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Privacy & FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} ExpenseMate. Designed with Apple precision for smart budgeters.</p>
            <p className="flex items-center gap-4">
              <span>Next.js 16</span>
              <span>•</span>
              <span>Tailwind CSS</span>
              <span>•</span>
              <span>MongoDB</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
