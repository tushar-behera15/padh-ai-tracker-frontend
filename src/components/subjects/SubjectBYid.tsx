'use client';

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SubjectScorePie from "@/components/charts/SubjectCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Chapter {
    id: string;
    name: string;
}

export async function fetchChapters(subjectId: string) {
    const res = await fetch(`http://localhost:5000/api/subject/${subjectId}/chapters`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch chapters");
    return res.json();
}

export async function fetchSubjectScore(subjectId: string) {
    const res = await fetch(`http://localhost:5000/api/subject/${subjectId}/scores`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch score summary");
    return res.json();
}

export default function SubjectDetailPage() {
    const { subjectId } = useParams<{ subjectId: string }>();

    const {
        data: chaptersData,
        isLoading: chaptersLoading,
        error: chaptersError,
    } = useQuery({
        queryKey: ["chapters", subjectId],
        queryFn: () => fetchChapters(subjectId),
        enabled: !!subjectId,
    });

    const {
        data: scoreData,
        isLoading: scoreLoading,
        error: scoreError,
    } = useQuery({
        queryKey: ["subject-score", subjectId],
        queryFn: () => fetchSubjectScore(subjectId),
        enabled: !!subjectId,
    });

    if (chaptersLoading || scoreLoading) {
        return <p className="text-center py-10">Loading subject data...</p>;
    }

    if (chaptersError || scoreError) {
        return <p className="text-center text-red-500 py-10">Failed to load subject data</p>;
    }

    const chapters: Chapter[] = chaptersData?.chapters ?? [];
    const summary = scoreData?.summary;

    return (
        <div className="space-y-4 px-3 sm:px-6 pb-6">
            {/* 📊 Subject Analytics */}
            <Card className="mt-2">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl">
                        Subject Analytics
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-6 sm:grid-cols-2">
                    {/* Left */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <p className="text-sm text-muted-foreground mb-1">
                            Overall Performance
                        </p>

                        {summary ? (
                            <>
                                <p className="text-3xl font-bold mb-4">
                                    {summary.average_percentage ?? 0}%
                                </p>

                                <div className="w-full max-w-55 sm:max-w-65">
                                    <SubjectScorePie
                                        percentage={summary.average_percentage ?? 0}
                                    />
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">No scores yet</p>
                        )}
                    </div>

                    {/* Right */}
                    <div className="grid grid-cols-3 sm:grid-cols-1 gap-3 text-sm text-center sm:text-left">
                        <div className="rounded-md bg-muted p-3">
                            <p className="text-muted-foreground">Weak</p>
                            <p className="font-semibold text-lg">
                                {summary?.weak ?? 0}
                            </p>
                        </div>

                        <div className="rounded-md bg-muted p-3">
                            <p className="text-muted-foreground">Average</p>
                            <p className="font-semibold text-lg">
                                {summary?.average ?? 0}
                            </p>
                        </div>

                        <div className="rounded-md bg-muted p-3">
                            <p className="text-muted-foreground">Strong</p>
                            <p className="font-semibold text-lg">
                                {summary?.strong ?? 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 📘 Chapters List */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl">
                        Chapters
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {chapters.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No chapters added yet.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {chapters.map((chapter) => (
                                <li
                                    key={chapter.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted transition"
                                >
                                    <span className="truncate text-sm sm:text-base">
                                        {chapter.name}
                                    </span>

                                    <Link
                                        href={`/dashboard/subjects/${subjectId}/chapters/${chapter.id}`}
                                        className="text-primary text-sm font-medium whitespace-nowrap"
                                    >
                                        View →
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
