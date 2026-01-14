'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Layers } from "lucide-react";
import Link from "next/link";

interface SubjectCardProps {
    id: string;
    name: string;
    chapterCount: number;
    pendingRevisions: number;
    scoreSummary: {
        weak: number;
        average: number;
        strong: number;
        average_percentage: number;
    };
}

export default function SubjectCard({
    id,
    name,
    chapterCount,
    pendingRevisions,
    scoreSummary,
}: SubjectCardProps) {
    const progress = scoreSummary?.average_percentage ?? 0;

    return (
        <Link href={`/dashboard/subjects/${id}`} className="group">
            <Card
                className="
                    relative h-full cursor-pointer overflow-hidden
                    border border-border/50
                    transition-all duration-300
                    hover:-translate-y-1 hover:shadow-lg
                    focus-visible:ring-2 focus-visible:ring-primary
                "
            >
                {/* Hover glow */}
                <div
                    className="
                        pointer-events-none absolute inset-0
                        opacity-0 transition-opacity duration-300
                        group-hover:opacity-100
                        bg-linear-to-br from-primary/5 via-transparent to-primary/10
                    "
                />

                <CardHeader className="relative space-y-1 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <span
                            className="
                                flex h-8 w-8 items-center justify-center rounded-md
                                bg-primary/10 text-primary
                            "
                        >
                            <BookOpen className="h-4 w-4" />
                        </span>
                        <span className="truncate">{name}</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="relative space-y-5">
                    {/* Average Score */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                Average score
                            </span>
                            <span className="font-medium tabular-nums">
                                {progress}%
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Strength Breakdown */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 py-2 text-center">
                        <Stat label="Weak" value={scoreSummary.weak} />
                        <Stat label="Average" value={scoreSummary.average} />
                        <Stat label="Strong" value={scoreSummary.strong} />
                    </div>

                    {/* Footer stats */}
                    <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Layers className="h-4 w-4" />
                            <span>{chapterCount} chapters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{pendingRevisions} revisions</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="space-y-0.5">
            <p className="text-sm font-semibold tabular-nums">
                {value}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
        </div>
    );
}
