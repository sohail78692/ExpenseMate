"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, PieChart, Calendar, Sparkles, Zap, Shield, BarChart3 } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="text-2xl font-bold text-white animate-pulse">Loading...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-700"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 pt-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.jpg"
              alt="ExpenseMate Logo"
              width={120}
              height={120}
              className="rounded-2xl shadow-2xl shadow-purple-500/20"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-500/30 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-200">Smart Expense Tracking</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-pulse">
              ExpenseMate
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your personal expense tracker with powerful analytics and insights.
            <br />
            <span className="text-purple-300 font-semibold">Take control of your finances today.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105">
                <Zap className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 border-purple-400/50 hover:border-purple-400 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hover:scale-105">
                Sign In
              </Button>
            </Link>
          </div>
        </div>


        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-md border-white/10 hover:border-blue-400/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-blue-400" />
                </div>
                <CardTitle className="text-white">Track Expenses</CardTitle>
                <CardDescription className="text-slate-300">
                  Easily add, edit, and manage your daily expenses with a simple, intuitive interface
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md border-white/10 hover:border-green-400/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
              <CardHeader>
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-white">Smart Analytics</CardTitle>
                <CardDescription className="text-slate-300">
                  View detailed charts and trends to understand your spending patterns better
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border-white/10 hover:border-purple-400/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <PieChart className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-white">Categories</CardTitle>
                <CardDescription className="text-slate-300">
                  Organize expenses by category and see exactly where your money goes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-md border-white/10 hover:border-orange-400/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-orange-400" />
                </div>
                <CardTitle className="text-white">Calendar View</CardTitle>
                <CardDescription className="text-slate-300">
                  Visual heatmap showing your spending intensity throughout the month
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-20 max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Why Choose ExpenseMate?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Private</h3>
              <p className="text-slate-300">Your financial data is encrypted and protected with industry-leading security</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Insights</h3>
              <p className="text-slate-300">Get instant insights into your spending habits and make informed decisions</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Beautiful UI</h3>
              <p className="text-slate-300">Clean, modern interface designed for the best user experience</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-0 shadow-2xl shadow-purple-500/50">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Ready to take control?</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of users managing their expenses smarter with ExpenseMate. Start your journey to financial freedom today!
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-12 py-6 bg-white text-purple-600 hover:bg-slate-100 font-bold shadow-xl hover:scale-105 transition-all">
                <Sparkles className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-slate-400">
            © 2024 ExpenseMate. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
