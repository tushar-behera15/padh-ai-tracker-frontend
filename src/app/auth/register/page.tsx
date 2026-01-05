'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import appLogo from "@/images/logo.png";

const Signup = () => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();


    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await res.json();
            console.log(data);
            if (res.ok) {
                toast.success("Registration successful! Redirecting to login...");
                router.push("/auth/login");
            } else {
                toast.error(data.message || "Registration failed!");
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
                        <div className="mx-auto w-20 h-20 bg-gradient-warm rounded-full flex items-center justify-center">
                            <Image src={appLogo} alt="app-logo" width={100} height={100} className="text-center" />
                        </div>
                        <CardTitle className="text-2xl">Create Account</CardTitle>
                        <CardDescription>Enhance your experience in Padhai</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSignup} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Email */}
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


                            {/* Password */}
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

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create a account"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="text-primary hover:underline font-medium"
                            >
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Signup;
