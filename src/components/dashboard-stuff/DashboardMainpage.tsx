/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";


import { CheckCircle, XCircle, Clock, Percent } from "lucide-react";
import WelcomeHero from "@/components/dashboard-stuff/WelcomeHero";
import StatCard from "@/components/dashboard-stuff/StatCard";
import PerformanceOverview from "@/components/dashboard-stuff/PerformanceOverview";
import UpcomingSummary from "@/components/dashboard-stuff/UpcomingSummary";
import TodaysFocus from "@/components/dashboard-stuff/TodayFocus";
import Link from "next/link";

/* ---------------- API ---------------- */

async function fetchMe() {
    const res = await fetch("/api/auth/me", {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Not authenticated");
    const data = await res.json();
    return data.user;
}

async function fetchRevisions() {
    const res = await fetch("/api/revision", {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch revisions");
    return res.json();
}

/* ---------------- HELPERS ---------------- */

function normalizeDate(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/* ---------------- PAGE ---------------- */

export default function DashboardPage() {
    const {
        data: userData,
        isLoading: userLoading,
        isError: userError,
    } = useQuery({
        queryKey: ["auth-me"],
        queryFn: fetchMe,
        staleTime: 0
    });

    const {
        data: revisionData,
        isLoading: revisionLoading,
        isError: revisionError,
    } = useQuery({
        queryKey: ["revisions"],
        queryFn: fetchRevisions,
        staleTime: 0
    });

    /* -------- Compute Stats -------- */

    const stats = useMemo(() => {
        const revisions = revisionData?.revisions ?? [];
        const today = normalizeDate(new Date());

        let completed = 0;
        let missed = 0;
        let upcoming = 0;
        const todayRevisions: any[] = [];
        const upcomingRevisions: any[] = [];


        revisions.forEach((r: any) => {
            const revDate = normalizeDate(new Date(r.revision_date));

            if (r.completed) completed++;
            else if (revDate < today) missed++;
            else {
                upcoming++;
                upcomingRevisions.push({
                    id: r.id,
                    subject: r.subject_name,
                    topic: r.chapter_name,
                });
            }


            if (!r.completed && revDate.getTime() === today.getTime()) {
                todayRevisions.push({
                    id: r.id,
                    subject: r.subject_name,
                    topic: r.chapter_name,
                });
            }
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
            todayRevisions,
            upcomingRevisions
        };
    }, [revisionData]);

    /* -------- Loading State -------- */
    if (userLoading || revisionLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading your dashboard...
                </p>
            </div>
        );
    }

    /* -------- Error State -------- */
    if (userError || revisionError) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <p className="text-sm text-destructive">
                    Failed to load dashboard data. Please refresh.
                </p>
            </div>
        );
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="mx-auto max-w-7xl px-6 py-8 space-y-10">

            {/* HERO */}
            <WelcomeHero
                userName={userData?.name?.split(" ")[0] ?? "Student"}
                completionRate={stats.completionRate}
            />

            {/* KPI CARDS */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    subtitle="Revisions done"
                    icon={CheckCircle}
                    variant="success"
                />
                <StatCard
                    title="Missed"
                    value={stats.missed}
                    subtitle="Needs attention"
                    icon={XCircle}
                    variant="danger"
                />
                <Link href="/dashboard/revisions">
                    <StatCard
                        title="Upcoming"
                        value={stats.upcoming}
                        subtitle="Planned ahead"
                        icon={Clock}
                        variant="warning"
                    />
                </Link>
                <StatCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    subtitle="Overall progress"
                    icon={Percent}
                    variant="primary"
                />
            </div>

            {/* MAIN GRID */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* PERFORMANCE */}
                <div className="lg:col-span-2">
                    <PerformanceOverview
                        completionRate={stats.completionRate}
                        totalRevisions={stats.total}
                        completedRevisions={stats.completed}
                    />
                </div>

                {/* UPCOMING */}
                <UpcomingSummary upcomingRevisions={stats.upcomingRevisions} />
            </div>

            {/* TODAY'S FOCUS */}
            <TodaysFocus todaysRevisions={stats.todayRevisions} />

        </div>
    );
}
