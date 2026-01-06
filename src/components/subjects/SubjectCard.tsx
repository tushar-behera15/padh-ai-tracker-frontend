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
        <Link href={`/dashboard/subjects/${id}`}>
            <Card className="hover:shadow-md transition cursor-pointer">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {name}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Average Score */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Average Score</span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} />
                    </div>

                    {/* Strength Breakdown */}
                    <div className="grid grid-cols-3 text-center text-xs">
                        <Stat label="Weak" value={scoreSummary.weak} />
                        <Stat label="Average" value={scoreSummary.average} />
                        <Stat label="Strong" value={scoreSummary.strong} />
                    </div>

                    {/* Footer stats */}
                    <div className="flex justify-between text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                            <Layers className="h-4 w-4" />
                            {chapterCount} Chapters
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {pendingRevisions} Revisions
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p className="font-semibold">{value}</p>
            <p className="text-muted-foreground">{label}</p>
        </div>
    );
}
