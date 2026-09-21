"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { sendOtp, verifyOtp, updateProfile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const RESEND_COOLDOWN = 20;

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, updateUser } = useAuth();

  // Steps: "phone" | "otp" | "email" | "welcome"
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isLoginModalOpen) {
      setStep("phone");
      setPhone("");
      setOtp("");
      setDevOtp("");
      setEmail("");
      setError("");
      setSuccessMsg("");
      setLoading(false);
      setCooldown(0);
      document.body.style.overflow = "hidden";
      setTimeout(() => phoneInputRef.current?.focus(), 150);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoginModalOpen]);

  // ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isLoginModalOpen) {
        closeLoginModal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoginModalOpen, closeLoginModal]);

  // OTP resend timer countdown (20s)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Focus input on step transition and handle auto-close on welcome
  useEffect(() => {
    if (step === "otp") {
      otpInputRef.current?.focus();
    } else if (step === "email") {
      emailInputRef.current?.focus();
    } else if (step === "welcome") {
      const redirectTimer = setTimeout(() => {
        closeLoginModal();
      }, 1600);
      return () => clearTimeout(redirectTimer);
    }
  }, [step, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  function isValidPhone(value) {
    return /^[6-9]\d{9}$/.test(value);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Step 1: Send OTP to Mobile Number
  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setDevOtp("");

    if (!isValidPhone(phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setStep("otp");
      setCooldown(RESEND_COOLDOWN);
      setSuccessMsg(`OTP sent to +91 ${phone}`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      const { token, isNewUser, user: authUserData } = res.data;

      // Save token and user in AuthContext
      login(token, authUserData);

      if (authUserData?.name) {
        setUserName(authUserData.name);
      }

      // If first-time user (or email is not set in DB), show Email Registration Step
      if (isNewUser || !authUserData?.email) {
        setStep("email");
      } else {
        // Returning user with email already stored: direct to Welcome Celebration!
        setStep("welcome");
      }
    } catch (err) {
      if (err.response?.data?.expired) {
        setCooldown(0);
        setError(err.response.data.message || "OTP has expired. Please click 'Resend OTP' to request a new code.");
      } else {
        setError(err.response?.data?.message || "Incorrect OTP. Please check and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Step 3: First-time Email Submission
  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile({ email });
      if (res.data?.user) {
        updateUser(res.data.user);
        if (res.data.user.name) setUserName(res.data.user.name);
      }
      setStep("welcome");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP handler
  async function handleResend() {
    if (cooldown > 0) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await sendOtp(phone);
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
      setSuccessMsg(`Fresh OTP sent to +91 ${phone}`);
      setTimeout(() => setSuccessMsg(""), 4000);
      otpInputRef.current?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-display">
      {/* Semi-Transparent Backdrop (Comet style overlay) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-fadeIn"
        onClick={closeLoginModal}
      />

      {/* Modal Container with Sharp Borders (rounded-none) */}
      <div
        className={`relative w-full max-w-[390px] md:max-w-[420px] bg-white border-2 border-black rounded-none shadow-2xl z-10 overflow-hidden flex flex-col justify-between p-6 sm:p-7 animate-fadeIn ${
          step === "welcome" ? "bg-black text-white border-orange-500 min-h-[420px]" : "min-h-[420px]"
        }`}
      >
        {/* Top-Right Close Button with Orange Hover */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-none border border-neutral-200 bg-white text-black hover:bg-orange-500 hover:text-white hover:border-orange-500 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          aria-label="Close"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: MOBILE NUMBER INPUT (Matching Comet Style) */}
        {/* ------------------------------------------------------------- */}
        {step === "phone" && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Top Brand Logo */}
            <div className="flex justify-center pt-2 pb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-dark.png"
                alt="MURTIPUJA"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>

            {/* Header & Title (Restored to previous format) */}
            <div className="text-center my-4">
              <h2 className="text-2xl sm:text-[25px] font-black tracking-tight text-black leading-tight">
                Enter Mobile Number
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-1.5 max-w-[270px] mx-auto leading-relaxed">
                We will send an OTP verification code to log into your account.
              </p>
            </div>

            {/* Mobile Form */}
            <form onSubmit={handleSendOtp} className="space-y-3.5 my-1">
              <div className="flex items-center border-2 border-black rounded-none bg-white overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 transition-all h-12 sm:h-[50px]">
                <span className="h-full px-4 sm:px-5 text-black font-black text-sm bg-neutral-100 border-r-2 border-black flex items-center select-none">
                  +91
                </span>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 h-full px-3.5 outline-none bg-transparent text-sm sm:text-base text-black placeholder-neutral-400 font-bold"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-500 rounded-none px-3 py-2 text-red-600 text-xs font-semibold leading-relaxed flex items-center gap-1.5 animate-fadeIn">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Vibrant Orange Send OTP Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 sm:h-[50px] rounded-none font-black text-xs sm:text-sm tracking-widest uppercase transition-all duration-200 border-2 ${
                  phone.length === 10 && !loading
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 active:scale-[0.99] shadow-md cursor-pointer"
                    : "bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed"
                }`}
              >
                {loading ? "SENDING OTP..." : "SEND OTP"}
              </button>
            </form>

            {/* Footer Terms */}
            <div className="text-center text-[10px] sm:text-[11px] text-neutral-400 mt-4 leading-relaxed font-normal">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                onClick={closeLoginModal}
                className="text-black font-bold hover:underline hover:text-orange-500"
              >
                T&C
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                onClick={closeLoginModal}
                className="text-black font-bold hover:underline hover:text-orange-500"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: OTP VERIFICATION */}
        {/* ------------------------------------------------------------- */}
        {step === "otp" && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Top Brand Logo */}
            <div className="flex justify-center pt-2 pb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-dark.png"
                alt="MURTIPUJA"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>

            {/* Header */}
            <div className="text-center my-3.5">
              <h2 className="text-2xl sm:text-[25px] font-black tracking-tight text-black leading-tight">
                Enter OTP
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-1.5 max-w-[270px] mx-auto leading-relaxed">
                Code sent to <span className="font-bold text-black">+91 {phone}</span>
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-3 my-1">
              <div>
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.5em] text-xl sm:text-2xl font-extrabold h-12 sm:h-[50px] border-2 border-black rounded-none bg-white outline-none focus:ring-2 focus:ring-orange-500 transition-all text-black"
                  required
                />
              </div>

              {devOtp && (
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="w-full text-center text-[11px] font-bold bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-300 py-1.5 px-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded-none"
                  title="Click to fill generated OTP"
                >
                  <span>🛠️ Dev OTP: <strong>{devOtp}</strong> (Auto-fill)</span>
                </button>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-500 rounded-none px-3.5 py-1.5 text-emerald-700 text-xs font-bold leading-relaxed flex items-center gap-1.5 animate-fadeIn">
                  <span>✓</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-500 rounded-none px-3.5 py-2 text-red-600 text-xs font-semibold leading-relaxed flex items-center gap-1.5 animate-fadeIn">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Expired Timer Notice */}
              {cooldown === 0 && !error && (
                <div className="bg-orange-50 border border-orange-400 rounded-none px-3 py-1.5 text-orange-900 text-[11px] font-bold leading-relaxed flex items-center justify-between animate-fadeIn">
                  <span>⏱️ OTP expired after 20s.</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-orange-700 underline font-black hover:text-black uppercase"
                  >
                    Resend Code →
                  </button>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 sm:h-[50px] rounded-none font-black text-xs sm:text-sm tracking-widest uppercase transition-all duration-200 border-2 ${
                  otp.length === 6 && !loading
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 active:scale-[0.99] shadow-md cursor-pointer"
                    : "bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed"
                }`}
              >
                {loading ? "VERIFYING..." : "VERIFY & CONTINUE"}
              </button>

              {/* Change Number & Resend */}
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="hover:text-black underline transition-colors font-bold"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className={`transition-colors font-extrabold ${
                    cooldown === 0
                      ? "text-orange-600 hover:text-black underline cursor-pointer"
                      : "text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center text-[10px] text-neutral-400 mt-4 leading-relaxed font-normal">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                onClick={closeLoginModal}
                className="text-black font-bold hover:underline hover:text-orange-500"
              >
                T&C
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                onClick={closeLoginModal}
                className="text-black font-bold hover:underline hover:text-orange-500"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: FIRST-TIME EMAIL REGISTRATION */}
        {/* ------------------------------------------------------------- */}
        {step === "email" && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Top Brand Logo */}
            <div className="flex justify-center pt-2 pb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-dark.png"
                alt="MURTIPUJA"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>

            {/* Header */}
            <div className="text-center my-3.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black leading-tight">
                Please Sign In<br />with Email.
              </h2>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5 my-1">
              <div className="space-y-1">
                <input
                  ref={emailInputRef}
                  type="email"
                  autoFocus
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 sm:h-[50px] px-4 border-2 border-black rounded-none bg-white outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm md:text-base text-black placeholder-neutral-400 font-semibold"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-500 rounded-none px-3.5 py-2 text-red-600 text-xs font-semibold leading-relaxed flex items-center gap-1.5 animate-fadeIn">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Orange Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 sm:h-[50px] rounded-none font-black text-xs md:text-sm tracking-widest uppercase transition-all duration-200 border-2 ${
                  email.trim().length > 3 && !loading
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 active:scale-[0.99] shadow-md cursor-pointer"
                    : "bg-orange-500/50 text-white/70 border-neutral-300 cursor-not-allowed"
                }`}
              >
                {loading ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center text-[10px] text-neutral-400 mt-4 leading-relaxed font-normal">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                onClick={closeLoginModal}
                className="text-black font-bold hover:underline hover:text-orange-500"
              >
                T&C
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                onClick={closeLoginModal}
                className="text-black font-bold hover:underline hover:text-orange-500"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: SUCCESS WELCOME SPLASH */}
        {/* ------------------------------------------------------------- */}
        {step === "welcome" && (
          <div className="flex-1 flex flex-col justify-between items-center text-center py-4">
            {/* Top Brand Logo in White */}
            <div className="flex justify-center pt-2 pb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-white.png"
                alt="MURTIPUJA"
                className="h-8 md:h-9 w-auto object-contain"
              />
            </div>

            {/* Center Content */}
            <div className="my-auto flex flex-col items-center justify-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                WELCOME,<br />
                <span className="text-orange-400">
                  {userName || "Devotee"}
                </span>
              </h2>
              <div className="text-5xl pt-1 animate-wave select-none">
                👋
              </div>
            </div>

            {/* Close */}
            <div className="pb-2">
              <button
                onClick={closeLoginModal}
                className="text-xs font-extrabold uppercase tracking-widest text-orange-400 hover:text-white underline transition-colors cursor-pointer"
              >
                Continue Browsing →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
