"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { CakeMark } from "@/components/ui/Logo";
import { api, ApiError } from "@/lib/api";
import { getToken, setToken } from "@/lib/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/admin");
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api("/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setToken(res.token);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-blush p-4">
      <form onSubmit={submit} autoComplete="off" className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card">
        <div className="mb-8 text-center">
          <CakeMark className="mx-auto h-14 w-14" />
          <h1 className="mt-4 text-2xl">Admin login</h1>
          <p className="mt-1 text-sm">Store dashboard</p>
        </div>
        <label className="mb-4 block">
          <span className="label">Email</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="mb-6 block">
          <span className="label">Password</span>
          <div className="relative">
            <input
              className="input pr-11"
              type={showPassword ? "text" : "password"}
              name="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-muted hover:text-brand"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="btn-brand h-12 w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Log in
        </button>
      </form>
    </main>
  );
}
