"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueries } from "@tanstack/react-query";
import SubjectScorePie from "@/components/charts/SubjectCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Chapter {
    id: string;
    name: string;
}

type PerformanceLevel = "weak" | "average" | "strong";

/* ---------------- API FUNCTIONS ---------------- */

async function fetchChapters(subjectId: string) {
    const res = await fetch(
        `http://localhost:5000/api/subject/${subjectId}/chapters`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch chapters");
    return res.json();
}

async function fetchSubjectScore(subjectId: string) {
    const res = await fetch(
        `http://localhost:5000/api/subject/${subjectId}/scores`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch subject score summary");
    return res.json();
}

async function fetchChapterScore(subjectId: string, chapterId: string) {
    const res = await fetch(
        `http://localhost:5000/api/subject/${subjectId}/chapters/${chapterId}/scores`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch chapter score summary");
    return res.json();
}

/* ---------------- PAGE ---------------- */

export default function SubjectDetailPage() {
    const { subjectId } = useParams<{ subjectId: string }>();

    /* 1️⃣ Fetch chapters */
    const {
        data: chaptersData,
        isLoading: chaptersLoading,
        error: chaptersError,
    } = useQuery({
        queryKey: ["chapters", subjectId],
        queryFn: () => fetchChapters(subjectId),
        enabled: !!subjectId,
    });

    /* 2️⃣ Fetch subject score summary */
    const {
        data: scoreData,
        isLoading: scoreLoading,
        error: scoreError,
    } = useQuery({
        queryKey: ["subject-score", subjectId],
        queryFn: () => fetchSubjectScore(subjectId),
        enabled: !!subjectId,
    });

    const chapters: Chapter[] = chaptersData?.chapters ?? [];

    /* 3️⃣ Fetch chapter score for EACH chapter (MANDATORY API) */
    const chapterScoreQueries = useQueries({
        queries: chapters.map((chapter) => ({
            queryKey: ["chapter-score", chapter.id],
            queryFn: () => fetchChapterScore(subjectId, chapter.id),
            enabled: !!subjectId,
        })),
    });

    const isChapterScoreLoading = chapterScoreQueries.some(
        (q) => q.isLoading
    );
    const isChapterScoreError = chapterScoreQueries.some(
        (q) => q.isError
    );

    if (chaptersLoading || scoreLoading || isChapterScoreLoading) {
        return <p className="text-center py-10">Loading subject data...</p>;
    }

    if (chaptersError || scoreError || isChapterScoreError) {
        return (
            <p className="text-center text-red-500 py-10">
                Failed to load subject data
            </p>
        );
    }

    /* 4️⃣ Build chapterId → performance_level map */
    const chapterLevelMap: Record<string, PerformanceLevel> = {};

    chapterScoreQueries.forEach((q, index) => {
        const chapterId = chapters[index]?.id;
        const level = q.data?.scores?.[0]?.performance_level;
        if (chapterId && level) {
            chapterLevelMap[chapterId] = level;
        }
    });

    const summary = scoreData?.summary;

    /* ---------------- UI ---------------- */

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
                    <div className="flex flex-col items-center sm:items-start">
                        <p className="text-sm text-muted-foreground mb-1">
                            Overall Performance
                        </p>

                        {summary ? (
                            <>
                                <p className="text-3xl font-bold mb-4">
                                    {summary.average_percentage ?? 0}%
                                </p>
                                <SubjectScorePie
                                    percentage={summary.average_percentage ?? 0}
                                />
                            </>
                        ) : (
                            <p className="text-muted-foreground">No scores yet</p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-1 gap-3 text-sm text-center sm:text-left">
                        <div className="rounded-md bg-muted p-3">
                            <p className="text-muted-foreground">Weak</p>
                            <p className="font-semibold text-lg"> {summary?.weak ?? 0}
                            </p>
                        </div>
                        <div className="rounded-md bg-muted p-3">
                            <p className="text-muted-foreground">Average</p>
                            <p className="font-semibold text-lg"> {summary?.average ?? 0} </p>
                        </div>
                        <div className="rounded-md bg-muted p-3">
                            <p className="text-muted-foreground">Strong</p>
                            <p className="font-semibold text-lg"> {summary?.strong ?? 0} </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 📘 Chapters List */}
            <Card>
                <CardHeader className="pb-3 flex justify-between">
                    <CardTitle className="text-lg sm:text-xl">
                        Chapters
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                        {chapters.length} total
                    </span>
                </CardHeader>

                <CardContent>
                    {chapters.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No chapters added yet.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {chapters.map((chapter) => {
                                const level =
                                    chapterLevelMap[chapter.id] ?? "weak";

                                const levelStyles = {
                                    weak: "border-red-200 bg-red-50",
                                    average: "border-yellow-200 bg-yellow-50",
                                    strong: "border-green-200 bg-green-50",
                                };

                                const dotStyles = {
                                    weak: "bg-red-500",
                                    average: "bg-yellow-500",
                                    strong: "bg-green-500",
                                };

                                return (
                                    <div key={chapter.id} className="flex">

                                        <Link

                                            href={`/dashboard/subjects/${subjectId}/chapters/${chapter.id}`}
                                        >
                                            <li

                                                className={`group flex justify-between rounded-lg border p-4 hover:shadow-sm transition ${levelStyles[level]}`}
                                            >

                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${dotStyles[level]}`}
                                                    />
                                                    <div>
                                                        <p className="font-medium">{chapter.name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">
                                                            {level} performance
                                                        </p>
                                                    </div>
                                                </div>


                                            </li>
                                        </Link>
                                    </div>

                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
