'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";
import { ModeToggle } from "@/components/layout/mode-toggle";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Login successful! Redirecting...");
                router.push("/");
            } else {
                toast.error(data.message || "Login failed!");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">

            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-pink-500/10 blur-[100px]" />
            </div>

            {/* Top bar */}
            <header className="relative flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">Padh-AI</span>
                </Link>
                <ModeToggle />
            </header>

            {/* Center card */}
            <div className="relative flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Glass card */}
                    <div className="rounded-2xl border bg-card/80 backdrop-blur-xl shadow-2xl p-8">

                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Sparkles className="h-7 w-7 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Sign in to your Padh-AI account
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 rounded-xl bg-background/60"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                    <Link href="/reset-password" className="text-xs text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPass ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11 rounded-xl bg-background/60 pr-11"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl text-sm font-semibold group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign In
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-medium text-primary hover:underline">
                                Create one free
                            </Link>
                        </p>
                    </div>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        By signing in, you agree to our{" "}
                        <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms</span>
                        {" & "}
                        <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
