"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setAuth } from "@/store/slices/appSlice";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // --- FORM STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  // --- HANDLERS ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      dispatch(setAuth(data.user));
      router.push("/classroom");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    // Fixed overlay layout perfectly hides the global layout footer and navbar
    <div className="fixed inset-0 z-50 w-full flex bg-neutral-100 overflow-hidden font-['Helvena']">
      {/* MOBILE LOGO (Visible only on smaller screens, positioned cleanly away from form) */}
      <div className="absolute top-6 left-6 z-50 lg:hidden">
        <Link href="/">
          <img
            src="/logo-dark-text.svg"
            alt="Edvara"
            className="h-8 transition-opacity hover:opacity-80"
          />
        </Link>
      </div>

      {/* --- LEFT SIDE: Branding Panel (Hidden on Mobile) --- */}
      <div className="hidden lg:flex w-[45%] xl:w-[40%] bg-[#FE6100] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex-col justify-between items-start pt-14 px-14 relative z-10 overflow-hidden">
        <div className="flex flex-col gap-10 z-20">
          <Link href="/">
            <img
              src="/whitelogoforbentogrid.svg"
              alt="Edvara"
              className="w-32 h-auto hover:opacity-90 transition-opacity"
            />
          </Link>
          <h2 className="text-white text-5xl xl:text-6xl font-normal font-['Libre_Baskerville'] leading-tight italic">
            Padhai bhi, <br />
            placement bhi.
          </h2>
        </div>
        <img
          src="/sachinHero.png"
          alt="Mentor"
          className="w-full max-w-[600px] xl:max-w-[750px] object-contain object-bottom self-center mt-auto z-10"
        />
      </div>

      {/* --- RIGHT SIDE: Interactive Form Container --- */}
      <div className="flex-1 flex flex-col p-5 sm:p-10 relative z-20 h-full overflow-y-auto no-scrollbar">
        {/* Form Wrapper */}
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[500px] mx-auto mt-16 lg:mt-0 pb-10 lg:pb-0">
          <div className="w-full flex flex-col items-center gap-6">
            {/* Header */}
            <div className="flex flex-col justify-center items-center w-full mb-2">
              <h2 className="text-center text-[#FE6100] text-xl sm:text-3xl font-normal font-['Libre_Baskerville'] italic leading-tight">
                Welcome Aboard!
              </h2>
              <h1 className="text-center text-neutral-950 text-2xl sm:text-4xl font-medium font-['Helvena']">
                Begin your journey today.
              </h1>
            </div>

            {/* Global Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Auth Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleAuth}
              className="w-full h-12 bg-white rounded-full outline outline-1 outline-neutral-300 flex justify-center items-center gap-3 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-stone-950 text-sm font-medium font-['Helvena']">
                Sign up with Google
              </span>
            </button>

            {/* Divider */}
            <div className="w-full flex justify-center items-center gap-6 my-2">
              <div className="flex-1 h-[1px] bg-gray-300"></div>
              <span className="text-black text-base font-medium font-['Helvena']">
                or
              </span>
              <div className="flex-1 h-[1px] bg-gray-300"></div>
            </div>

            {/* Form Elements */}
            <form
              onSubmit={handleLogin}
              className="w-full flex flex-col gap-4 sm:gap-5"
            >
              {/* Email */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-black text-sm font-medium font-['Helvena']">
                  Email
                </label>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@edvara.com"
                  className="w-full h-11 px-3 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <div className="w-full flex justify-between items-center">
                  <label className="text-black text-sm font-medium font-['Helvena']">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#FE6100] text-xs font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full h-11 pl-3 pr-10 py-2 rounded-lg bg-white outline outline-1 outline-neutral-200 focus:outline-[#FE6100] transition-colors text-stone-900 text-sm font-medium placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-neutral-950 rounded-lg shadow-lg flex justify-center items-center gap-2 hover:bg-neutral-800 transition-all disabled:opacity-70 group"
              >
                <span className="text-white text-sm font-medium font-['Helvena'] leading-5">
                  {isLoading ? "Logging in..." : "Continue"}
                </span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-2">
              <span className="text-neutral-950 text-sm font-medium font-['Helvena']">
                New user?{" "}
              </span>
              <Link
                href="/register"
                className="text-[#FE6100] text-sm font-medium font-['Helvena'] hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
