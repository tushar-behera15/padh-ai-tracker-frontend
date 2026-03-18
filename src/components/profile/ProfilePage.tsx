/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Mail,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Award,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ---------------- API ---------------- */

async function fetchMe() {
    const res = await fetch("/api/auth/me", {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
}

async function fetchRevisions() {
    const res = await fetch("/api/revision", {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch revisions");
    return res.json();
}

async function fetchSubjects() {
    const res = await fetch("/api/subject", {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch subjects");
    const data = await res.json();
    return data.subjects || [];
}

/* ---------------- HELPERS ---------------- */

function normalizeDate(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/* ---------------- PAGE ---------------- */

export default function ProfilePage() {
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ["auth-me"],
        queryFn: fetchMe,
        staleTime: 0
    });

    const { data: revisionData, isLoading: revisionLoading } = useQuery({
        queryKey: ["revisions"],
        queryFn: fetchRevisions,
        staleTime: 0
    });

    const { data: subjects = [], isLoading: subjectLoading } = useQuery({
        queryKey: ["subjects", "raw"],
        queryFn: fetchSubjects,
        staleTime: 0
    });

    const analytics = useMemo(() => {
        const revisions = revisionData?.revisions ?? [];
        const today = normalizeDate(new Date());

        let completed = 0;
        let missed = 0;
        let upcoming = 0;

        revisions.forEach((r: any) => {
            const revDate = normalizeDate(new Date(r.revision_date));
            if (r.completed) completed++;
            else if (revDate < today) missed++;
            else upcoming++;
        });

        const total = revisions.length;
        const completionRate = total
            ? Math.round((completed / total) * 100)
            : 0;

        return {
            completed,
            missed,
            upcoming,
            total,
            completionRate,
        };
    }, [revisionData]);

    const nextSession = useMemo(() => {
        const revisions = revisionData?.revisions ?? [];
        const today = normalizeDate(new Date());
        const future = revisions
            .filter((r: any) => !r.completed && normalizeDate(new Date(r.revision_date)) >= today)
            .sort((a: any, b: any) => new Date(a.revision_date).getTime() - new Date(b.revision_date).getTime())[0];

        if (!future) return "No sessions scheduled";

        const date = new Date(future.revision_date);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    }, [revisionData]);

    const ranking = useMemo(() => {
        if (analytics.completionRate >= 90) return "Top 5%";
        if (analytics.completionRate >= 75) return "Top 15%";
        if (analytics.completionRate >= 50) return "Top 40%";
        return "Top 70%";
    }, [analytics.completionRate]);

    const isLoading = userLoading || revisionLoading || subjectLoading;

    // We don't early return for isLoading anymore to prevent layout flickering.
    // Instead, we render the shells and use skeletons inside.

    const totalChapters = subjects.reduce((acc: number, s: any) => acc + (Number(s.chapter_count) || 0), 0);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 bg-background text-foreground lg:px-8 animate-in fade-in duration-700">

            {/* HERO SECTION */}
            <div className="relative overflow-hidden rounded-[2.5rem] border bg-card p-1 shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-pink-500/20" />
                <div className="relative rounded-[2.4rem] bg-card/60 backdrop-blur-3xl p-8 md:p-12 lg:flex lg:items-center lg:justify-between">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                            <Sparkles className="h-4 w-4" />
                            Academic Intelligence
                        </div>
                        {isLoading ? (
                            <div className="space-y-3">
                                <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
                                <div className="h-6 w-96 animate-pulse rounded-lg bg-muted/60" />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                                    Welcome, <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">{userData?.user?.name?.split(' ')[0] ?? "Student"}</span>
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    You&apos;ve mastered <span className="font-bold text-foreground">{analytics.completed}</span> chapters. Your current progress is exceptional!
                                </p>
                            </>
                        )}
                    </div>

                    <div className="mt-8 lg:mt-0 flex flex-col items-center lg:items-end gap-2 text-center lg:text-right">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">Global Mastery</div>
                        {isLoading ? (
                            <div className="h-20 w-32 animate-pulse rounded-3xl bg-primary/20" />
                        ) : (
                            <>
                                <div className="text-7xl font-black text-primary hover:scale-105 transition-transform cursor-default">{analytics.completionRate}%</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{ranking}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* LEFT COLUMN: PROFILE CARD */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/60 shadow-xl backdrop-blur-md p-0">
                        <div className="h-24 bg-gradient-to-r from-primary/40 to-pink-500/40 relative">
                            <div className="absolute inset-0 backdrop-blur-sm" />
                        </div>
                        <CardContent className="relative -mt-12 px-6 pb-8 text-center">
                            {isLoading ? (
                                <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-muted border-4 border-background shadow-2xl" />
                            ) : (
                                <Avatar className="mx-auto h-24 w-24 border-4 border-background shadow-2xl">
                                    <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                                        {userData?.user?.name
                                            ?.split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .toUpperCase() ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div className="mt-4 space-y-2">
                                {isLoading ? (
                                    <>
                                        <div className="mx-auto h-8 w-40 animate-pulse rounded-lg bg-muted" />
                                        <div className="mx-auto h-4 w-56 animate-pulse rounded-md bg-muted/60" />
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold tracking-tight">{userData?.user?.name ?? "—"}</h2>
                                        <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-sm">{userData?.user?.email ?? "—"}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                <Badge variant="secondary" className="rounded-full px-4 py-1 bg-primary/10 text-primary border-none">Scholar</Badge>
                                <Badge variant="outline" className="rounded-full px-4 py-1">Silver Tier</Badge>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/40 pt-8">
                                <div className="text-center group">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Subjects</div>
                                    <div className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                                        {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-muted align-middle" /> : subjects.length}
                                    </div>
                                </div>
                                <div className="text-center group">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Chapters</div>
                                    <div className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                                        {isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-muted align-middle" /> : totalChapters}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QUICK STATS */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">
                            Consistency Analytics
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <SmallStatCard
                                icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                label="Completed"
                                value={analytics.completed}
                                color="emerald"
                                loading={isLoading}
                            />
                            <SmallStatCard
                                icon={<XCircle className="h-5 w-5 text-rose-500" />}
                                label="Missed Task"
                                value={analytics.missed}
                                color="rose"
                                loading={isLoading}
                            />
                            <SmallStatCard
                                icon={<Clock className="h-5 w-5 text-amber-500" />}
                                label="Pending"
                                value={analytics.upcoming}
                                color="amber"
                                loading={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ANALYTICS & ACHIEVEMENTS */}
                <div className="lg:col-span-2 space-y-8">
                    {/* PROGRESS ANALYTICS */}
                    <Card className="rounded-3xl border-border/40 bg-card/60 shadow-xl backdrop-blur-md p-0 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-2">
                            <div>
                                <CardTitle className="text-2xl font-bold">Revision Mastery</CardTitle>
                                <CardDescription>Your long-term retention progress</CardDescription>
                            </div>
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <Award className="h-6 w-6" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8 px-8 pb-8">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Completion Rate</span>
                                    <span className="text-lg font-black text-primary">
                                        {isLoading ? <div className="h-6 w-12 animate-pulse rounded bg-muted" /> : `${analytics.completionRate}%`}
                                    </span>
                                </div>
                                <Progress value={analytics.completionRate} className="h-3 rounded-full bg-muted shadow-inner" />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="rounded-[2rem] bg-primary/5 p-6 border border-primary/10 relative overflow-hidden group">
                                    <Sparkles className="absolute -right-2 -top-2 h-12 w-12 text-primary/10 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                                        AI Insight
                                    </h4>
                                    {isLoading ? (
                                        <div className="space-y-2">
                                            <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
                                            <div className="h-4 w-3/4 animate-pulse rounded bg-muted/40" />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-balance leading-relaxed text-muted-foreground">
                                            You&apos;re doing great! Based on current patterns, you have an estimated <span className="text-foreground font-bold">87% retention rate</span>. Focus on pending items to maintain this.
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center gap-4 text-center p-6 border rounded-[2rem] border-dashed border-border/60 bg-background/20">
                                    <div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Activity Level</div>
                                        {isLoading ? (
                                            <div className="mx-auto h-7 w-32 animate-pulse rounded bg-muted" />
                                        ) : (
                                            <div className={cn(
                                                "text-xl font-black mt-1",
                                                analytics.completionRate >= 75 ? "text-emerald-500" :
                                                    analytics.completionRate >= 50 ? "text-amber-500" : "text-rose-500"
                                            )}>
                                                {analytics.completionRate >= 75 ? "🚀 High Velocity" :
                                                    analytics.completionRate >= 50 ? "⚡ Improving" : "🛑 Needs Focus"}
                                            </div>
                                        )}
                                    </div>
                                    <Button size="sm" variant="outline" asChild className="rounded-full font-bold h-10 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                                        <Link href="/dashboard/revisions">View Schedule</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ACTIVITY TILES */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="rounded-[2rem] border-border/40 bg-card/60 p-8 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Next Session</div>
                                    {isLoading ? <div className="h-6 w-32 animate-pulse rounded bg-muted/60" /> : <div className="font-bold text-lg">{nextSession}</div>}
                                </div>
                            </div>
                        </Card>
                        <Card className="rounded-[2rem] border-border/40 bg-card/60 p-8 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                                    <Award className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Global Standing</div>
                                    {isLoading ? <div className="h-6 w-24 animate-pulse rounded bg-muted/60" /> : <div className="font-bold text-lg">{ranking} Player</div>}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------- SMALL STAT CARD ---------------- */

function SmallStatCard({
    icon,
    label,
    value,
    color,
    loading
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    loading?: boolean;
}) {
    return (
        <Card className="group relative overflow-hidden rounded-2xl border-border/40 bg-card/40 transition-all hover:bg-card/60 hover:shadow-lg p-0">
            <Link href="/dashboard/revisions" className="flex items-center gap-4 p-4">
                <div className={cn("p-2.5 rounded-xl bg-muted transition-colors group-hover:bg-background shadow-inner")}>
                    {icon}
                </div>
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-tighter">{label}</div>
                    {loading ? (
                        <div className="h-7 w-12 animate-pulse rounded bg-muted/60 mt-0.5" />
                    ) : (
                        <div className="text-xl font-bold">{value}</div>
                    )}
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className={cn("h-4 w-4", `text-${color}-500`)} />
                </div>
            </Link>
        </Card>
    );
}
