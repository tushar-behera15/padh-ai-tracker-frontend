'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import appLogo from "@/images/logo.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Login successful! Redirecting...");
                router.push("/")
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
        <div className="min-h-screen flex flex-col">

            <div className="flex-1 flex items-center justify-center bg-gradient-hero p-4">
                <Card className="w-full max-w-md shadow-hover">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mb-4">
                            <Image src={appLogo} alt="app-logo" width={100} height={100} className="text-center" />
                        </div>
                        <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
                        <CardDescription>Login to your Padh-Ai tracker account</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="text-right">
                                <Link href="/reset-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            Don’t have an account?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;
