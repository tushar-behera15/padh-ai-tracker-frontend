/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ---------------- API ---------------- */

async function fetchMe() {
    const res = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
    });
    // console.log(res);
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
}

async function fetchRevisions() {
    const res = await fetch("http://localhost:5000/api/revision", {
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

export default function ProfilePage() {
    const { data: userData } = useQuery({
        queryKey: ["auth-me"],
        queryFn: fetchMe,
        staleTime: 1000 * 60 * 5,
    });

    const { data: revisionData } = useQuery({
        queryKey: ["revisions"],
        queryFn: fetchRevisions,
        staleTime: 1000 * 60 * 5,
    });
    console.log(revisionData);

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

    return (
        <div className="mx-auto max-w-7xl px-6 py-8 space-y-10 bg-background text-foreground">

            {/* HERO */}
            <div className="relative overflow-hidden rounded-3xl border bg-card p-8">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
                <div className="relative">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Profile Overview
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Track your progress and revision performance
                    </p>
                </div>
            </div>

            {/* PROFILE INFO */}
            <Card className="rounded-2xl">
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6">

                    {/* Avatar */}
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                            {userData?.user?.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase() ?? "U"}
                        </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {userData?.user?.name ?? "—"}
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            {userData?.user?.email ?? "—"}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <Badge variant="secondary">Student</Badge>
                            <Badge variant="outline">Padh-AI User</Badge>
                        </div>
                    </div>

                    {/* Optional right-side meta (future ready) */}
                    <div className="text-sm text-muted-foreground">
                        Member since
                        <div className="font-medium text-foreground">
                            {new Date().getFullYear()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* STATS */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Completed Revisions"
                    value={analytics.completed}
                    color="green"
                />
                <StatCard
                    title="Missed Revisions"
                    value={analytics.missed}
                    color="red"
                />
                <StatCard
                    title="Upcoming Revisions"
                    value={analytics.upcoming}
                    color="yellow"
                />
            </div>

            {/* ANALYTICS */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Progress Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            Completion Rate
                        </span>
                        <Badge variant="secondary">
                            {analytics.completionRate}%
                        </Badge>
                    </div>

                    <Progress value={analytics.completionRate} />

                    <p className="text-sm text-muted-foreground">
                        {analytics.completionRate >= 75
                            ? "🔥 Excellent consistency! Keep it up."
                            : analytics.completionRate >= 50
                                ? "📈 Good progress. Try to avoid missed revisions."
                                : "⚠️ Low completion rate. Focus on consistency."}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

/* ---------------- STAT CARD ---------------- */

function StatCard({
    title,
    value,
    color,
}: {
    title: string;
    value: number;
    color: "green" | "red" | "yellow";
}) {
    const colorMap = {
        green: "text-green-600 dark:text-green-400",
        red: "text-red-600 dark:text-red-400",
        yellow: "text-yellow-600 dark:text-yellow-400",
    };

    return (
        <Card className="rounded-2xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <span className={`text-4xl font-semibold ${colorMap[color]}`}>
                    {value}
                </span>
            </CardContent>
        </Card>
    );
}
