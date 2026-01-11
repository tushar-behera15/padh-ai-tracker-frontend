'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Revision {
    id: string;
    revision_date: string;
    completed: boolean;
    chapter_name: string;
    subject_name: string;
}

interface RevisionResponse {
    message: string;
    revisions: Revision[];
}

/* ---------------- API ---------------- */

async function fetchRevisions(): Promise<RevisionResponse> {
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

function getRevisionStatus(revision: Revision) {
    const today = normalizeDate(new Date());
    const revDate = normalizeDate(new Date(revision.revision_date));

    if (!revision.completed && revDate < today) return "missed";
    if (revision.completed) return "completed";
    return "pending";
}

/* ---------------- PAGE ---------------- */

export default function RevisionCalendarPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );

    const { data, isLoading } = useQuery<RevisionResponse>({
        queryKey: ["revisions"],
        queryFn: fetchRevisions,
        staleTime: 1000 * 60 * 5,
    });

    /* -------- Group revisions by date -------- */

    const revisionsByDate = useMemo(() => {
        const map: Record<string, Revision[]> = {};

        data?.revisions.forEach((rev) => {
            const key = new Date(rev.revision_date)
                .toISOString()
                .split("T")[0];

            if (!map[key]) map[key] = [];
            map[key].push(rev);
        });

        return map;
    }, [data]);

    const today = normalizeDate(new Date());

    /* -------- Calendar rules -------- */

    function isPastDateWithoutRevision(date: Date) {
        const key = date.toISOString().split("T")[0];
        const hasRevision = !!revisionsByDate[key];
        return normalizeDate(date) < today && !hasRevision;
    }

    const selectedKey = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : "";

    const selectedRevisions = revisionsByDate[selectedKey] || [];

    if (isLoading) {
        return <div className="p-6">Loading revision calendar...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl p-6 space-y-8">
            {/* HERO */}
            <div className="rounded-2xl border bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    Revision Calendar
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Track completed, pending & missed revisions
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                {/* CALENDAR */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                    </CardHeader>

                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={isPastDateWithoutRevision}
                            className="rounded-md border"
                            modifiers={{
                                hasRevision: (date) => {
                                    const key = date.toISOString().split("T")[0];
                                    return !!revisionsByDate[key];
                                },
                                missed: (date) => {
                                    const key = date.toISOString().split("T")[0];
                                    const revisions = revisionsByDate[key];
                                    if (!revisions) return false;

                                    return revisions.some(
                                        (r) =>
                                            !r.completed &&
                                            normalizeDate(
                                                new Date(r.revision_date)
                                            ) < today
                                    );
                                },
                            }}
                            modifiersClassNames={{
                                hasRevision:
                                    "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-indigo-500",
                                missed:
                                    "bg-red-500/10 text-red-600 font-semibold",
                            }}
                        />
                    </CardContent>
                </Card>

                {/* REVISION LIST */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>
                            {selectedDate
                                ? selectedDate.toDateString()
                                : "Select a date"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {selectedRevisions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No revisions scheduled for this date.
                            </p>
                        ) : (
                            selectedRevisions.map((rev) => {
                                const status = getRevisionStatus(rev);

                                return (
                                    <div
                                        key={rev.id}
                                        className={cn(
                                            "rounded-xl border p-4 transition",
                                            status === "completed" &&
                                            "bg-green-500/5 border-green-500/20",
                                            status === "pending" &&
                                            "bg-background",
                                            status === "missed" &&
                                            "bg-red-500/5 border-red-500/30"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold">
                                                    {rev.chapter_name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {rev.subject_name}
                                                </p>
                                            </div>

                                            <Badge
                                                className={cn(
                                                    "capitalize",
                                                    status === "completed" &&
                                                    "bg-green-500 text-white",
                                                    status === "pending" &&
                                                    "bg-yellow-500 text-white",
                                                    status === "missed" &&
                                                    "bg-red-500 text-white"
                                                )}
                                            >
                                                {status}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
