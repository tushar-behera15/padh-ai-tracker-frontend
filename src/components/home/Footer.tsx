import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Brand */}
                    <div className="col-span-1 lg:col-span-2">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Sparkles className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">Padh-AI-Tracker</span>
                        </div>
                        <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
                            An AI-powered study planner that analyzes your scores and schedules revisions automatically — so you study smarter, not harder.
                        </p>
                        <p className="mt-4 text-xs text-muted-foreground">
                            Built for JEE, NEET, and board exam students.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4">Product</h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                            <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                            <li><Link href="/#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link></li>
                            <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4">Account</h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                            <li><Link href="/register" className="hover:text-foreground transition-colors">Get Started Free</Link></li>
                            <li><Link href="/dashboard/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Padh-AI-Tracker. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Made with ❤️ for students everywhere
                    </p>
                </div>
            </div>
        </footer>
    );
}
