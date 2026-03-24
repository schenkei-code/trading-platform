"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00FF88]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 space-y-8 relative">
        <div className="text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#00FF88] mb-3">
            Get Started
          </p>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            Create Account
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Start automated trading in minutes
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: implement registration
          }}
        >
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF88]/30 focus:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-300 font-mono text-sm"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF88]/30 focus:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-300 font-mono text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF88]/30 focus:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-300 font-mono text-sm"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>

          <div className="flex items-start gap-2 text-xs">
            <input type="checkbox" className="rounded border-white/10 bg-white/5 accent-[#00FF88] mt-0.5" required />
            <span className="text-white/40">
              I agree to the{" "}
              <Link href="#" className="text-[#00FF88]/60 hover:text-[#00FF88] transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#00FF88]/60 hover:text-[#00FF88] transition-colors">
                Privacy Policy
              </Link>
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] font-bold rounded-full hover:shadow-[0_0_30px_rgba(0,255,136,0.2)] transition-all duration-300 text-sm uppercase tracking-wider"
          >
            Create Account
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-[#0a0a0a] text-white/20 uppercase tracking-widest text-[9px] font-black">
              Or
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-white/30">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00FF88] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
