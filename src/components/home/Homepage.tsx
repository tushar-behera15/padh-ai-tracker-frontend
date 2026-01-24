'use client'
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Carousel from "./Carousel";

export default function HomeHero() {
    async function fetchMe() {
        const res = await fetch("http://localhost:5000/api/auth/me", {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Not authenticated");
        }

        return res.json();
    }

    const { isLoading, isError } = useQuery({
        queryKey: ["auth-me"],
        queryFn: fetchMe,
        retry: false,

    })

    const isLoggedIn = !isError;
    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading Home Page…
                </p>
            </div>
        )
    }
    return (
        <>

            <section className="relative overflow-hidden bg-background text-foreground">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

                <div className="relative mx-auto max-w-7xl px-6 py-12">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">

                        {/* LEFT CONTENT */}
                        <div className="space-y-6">
                            <span className="inline-flex items-center rounded-full border px-4 py-1 text-sm text-muted-foreground">
                                🚀 AI-Powered Study Planner
                            </span>

                            <h1 className="text-4xl font-bold  sm:text-5xl lg:text-6xl">
                                Study smarter.{" "} <br />
                                <span className="text-primary">Revise on time.</span>{" "}
                                Perform better.
                            </h1>

                            <p className="max-w-xl text-base sm:text-lg text-muted-foreground">
                                Padh-AI-Tracker analyzes your scores and automatically
                                schedules revisions so you never miss what matters most.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {isLoggedIn ? (
                                    <>
                                        <Link href="/dashboard">
                                            <button className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
                                                Go to Dashboard
                                            </button>
                                        </Link>

                                        <button className="rounded-xl border px-6 py-3 text-sm font-medium text-foreground bg-background/60
  backdrop-blur-md hover:bg-muted transition">
                                            See How It Works
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login">
                                            <button className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
                                                Get Started Free
                                            </button>
                                        </Link>

                                        <button className="rounded-xl border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition">
                                            See How It Works
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* RIGHT VISUAL */}
                        <div className="relative hidden lg:block">
                            <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />

                            <div className="relative rounded-3xl border bg-card p-6 shadow-xl">
                                <div className="space-y-4">
                                    <div className="h-3 w-1/3 rounded bg-muted" />
                                    <div className="h-4 w-full rounded bg-muted" />
                                    <div className="h-4 w-5/6 rounded bg-muted" />

                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="rounded-xl bg-green-500/10 p-4">
                                            <p className="text-sm font-medium">
                                                Strong Chapters
                                            </p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                12
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-red-500/10 p-4">
                                            <p className="text-sm font-medium">
                                                Needs Revision
                                            </p>
                                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                5
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-linear-to-b from-transparent to-background" />
            </section>
            <Carousel />

        </>

    );
}
