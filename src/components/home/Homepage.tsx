'use client'
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Brain, CalendarCheck, BarChart3, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Footer from "./Footer";
import { ModeToggle } from "@/components/layout/mode-toggle";

async function fetchMe() {
    const res = await fetch(`/api/auth/me`, { credentials: "include" });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
}

const features = [
    {
        icon: Brain,
        title: "AI-Powered Analysis",
        description: "Our AI analyzes your test scores and pinpoints exactly which chapters need the most attention.",
        gradient: "from-indigo-500 to-purple-600",
        bg: "bg-indigo-500/10",
    },
    {
        icon: CalendarCheck,
        title: "Smart Revision Plans",
        description: "Get a personalized revision schedule using spaced repetition — proven to boost long-term retention.",
        gradient: "from-pink-500 to-rose-600",
        bg: "bg-pink-500/10",
    },
    {
        icon: BarChart3,
        title: "Progress Tracking",
        description: "Visual dashboards show completion rates, missed revisions, and performance trends at a glance.",
        gradient: "from-emerald-500 to-teal-600",
        bg: "bg-emerald-500/10",
    },
];

const stats = [
    { value: "3×", label: "Better retention with spaced repetition" },
    { value: "Auto", label: "AI-scheduled revision reminders" },
    { value: "100%", label: "Free to use, no credit card needed" },
];

const testimonials = [
    { name: "Arjun S.", role: "JEE Aspirant", quote: "My weak chapters improved by 30% after just 2 weeks of following the AI schedules." },
    { name: "Priya M.", role: "NEET Student", quote: "Finally a tracker that tells me not just what to study but WHEN to revise. Game changer." },
    { name: "Rishi K.", role: "Board Exam Prep", quote: "The automatic revision plan saved me so much planning time. I just study, it handles the rest." },
];

export default function HomeHero() {
    // No loading block — render immediately with default "not logged in" state
    const { data, isSuccess, isLoading } = useQuery({
        queryKey: ["auth-me"],
        queryFn: fetchMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const isLoggedIn = isSuccess && !!data;

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            {/* ── Navbar ── */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/20">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Padh-AI</span>
                    </div>
                    <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
                        <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <div className="min-w-[120px] flex justify-end">
                            {isLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : isLoggedIn ? (
                                <Link href="/dashboard">
                                    <button className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                        Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login">
                                        <button className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Log In</button>
                                    </Link>
                                    <Link href="/register">
                                        <button className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                            Join Free
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                {/* Background blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[100px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-[80px]" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28">
                    <div className="flex flex-col items-center text-center">
                        {/* Badge */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="font-medium">AI-Powered Study Planner</span>
                        </div>

                        {/* Headline */}
                        <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                            Study smarter.{" "}
                            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Revise on time.
                            </span>
                            <br />
                            Perform better.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                            Padh-AI-Tracker analyzes your scores, identifies weak chapters, and automatically
                            schedules revisions so you never miss what matters most.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row min-h-[60px]">
                            {isLoading ? (
                                <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
                            ) : isLoggedIn ? (
                                <Link href="/dashboard">
                                    <button className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-all hover:scale-105">
                                        Go to Dashboard
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/register">
                                        <button className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-all hover:scale-105">
                                            Get Started Free
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                    <a href="#features">
                                        <button className="rounded-xl border px-8 py-4 text-base font-medium text-foreground hover:bg-muted transition-colors">
                                            See How It Works
                                        </button>
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Trust row */}
                        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                            {["No credit card required", "Free forever plan", "AI-scheduled revisions"].map((t) => (
                                <span key={t} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Dashboard Preview Card */}
                    <div className="mt-20 mx-auto max-w-4xl rounded-2xl border bg-card shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-3">
                            <div className="h-3 w-3 rounded-full bg-red-400" />
                            <div className="h-3 w-3 rounded-full bg-yellow-400" />
                            <div className="h-3 w-3 rounded-full bg-green-400" />
                            <span className="ml-3 text-xs text-muted-foreground">padh-ai-tracker / dashboard</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
                            {[
                                { label: "Completed", value: "24", color: "text-green-500", bg: "bg-green-500/10" },
                                { label: "Missed", value: "3", color: "text-red-500", bg: "bg-red-500/10" },
                                { label: "Upcoming", value: "12", color: "text-yellow-500", bg: "bg-yellow-500/10" },
                                { label: "Completion", value: "88%", color: "text-indigo-500", bg: "bg-indigo-500/10" },
                            ].map((s) => (
                                <div key={s.label} className={`rounded-xl ${s.bg} p-4`}>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                    <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 pb-6">
                            <div className="rounded-xl border bg-muted/30 p-4">
                                <p className="text-xs font-medium text-muted-foreground mb-3">Today&apos;s Revision Focus</p>
                                <div className="space-y-2">
                                    {["Physics — Wave Optics", "Chemistry — Organic Mechanisms", "Math — Integration"].map((item) => (
                                        <div key={item} className="flex items-center gap-2 text-sm">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="border-y bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        {stats.map((s) => (
                            <div key={s.label} className="flex flex-col items-center text-center">
                                <span className="text-4xl font-extrabold text-primary">{s.value}</span>
                                <span className="mt-1 text-sm text-muted-foreground">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="mx-auto max-w-7xl px-6 py-24">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        Everything you need to{" "}
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            ace your exams
                        </span>
                    </h2>
                    <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                        Built around proven study science. No fluff — just tools that actually help you remember more.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {features.map((f) => (
                        <div key={f.title} className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg transition-shadow">
                            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>
                                <f.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">{f.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" className="bg-muted/30 py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
                        <p className="mt-3 text-muted-foreground">Three simple steps to a smarter study routine.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            { step: "01", title: "Add your subjects & chapters", desc: "Organize your syllabus by adding subjects and their chapters in seconds." },
                            { step: "02", title: "Log your test scores", desc: "Enter scores after each test. The AI instantly calculates your performance level." },
                            { step: "03", title: "Follow your AI revision plan", desc: "Get a personalized schedule. Mark revisions complete as you go and watch your scores rise." },
                        ].map((s) => (
                            <div key={s.step} className="relative flex flex-col gap-3 rounded-2xl border bg-card p-6">
                                <span className="text-5xl font-black text-primary/15">{s.step}</span>
                                <h3 className="text-lg font-semibold -mt-2">{s.title}</h3>
                                <p className="text-sm text-muted-foreground">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section id="testimonials" className="mx-auto max-w-7xl px-6 py-24">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        Why students love{" "}
                        <span className="text-primary">Padh-AI</span>
                    </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <div key={t.name} className="rounded-2xl border bg-card p-6 shadow-sm">
                            <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="relative overflow-hidden bg-primary py-20">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                        Ready to study smarter?
                    </h2>
                    <p className="mt-4 text-primary-foreground/80">
                        Join students who are using AI to plan their revisions and stop forgetting what they&apos;ve learned.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center min-h-[50px]">
                        {isLoading ? (
                            <div className="h-10 w-40 animate-pulse rounded-xl bg-white/20" />
                        ) : isLoggedIn ? (
                            <Link href="/dashboard">
                                <button className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-primary hover:bg-white/90 transition-colors hover:scale-105 transition-transform">
                                    Open Dashboard
                                </button>
                            </Link>
                        ) : (
                            <Link href="/register">
                                <button className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-primary hover:bg-white/90 transition-colors hover:scale-105 transition-transform">
                                    Get Started Free — No Credit Card
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <Footer />
        </div>
    );
}
