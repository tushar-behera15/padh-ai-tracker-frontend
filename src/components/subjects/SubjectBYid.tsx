"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import SubjectScorePie from "@/components/charts/SubjectCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface Chapter {
    id: string;
    name: string;
}

type PerformanceLevel = "weak" | "average" | "strong" | "null";

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

async function deleteSubject(subjectId: string) {
    const res = await fetch(`http://localhost:5000/api/subject/${subjectId}`,
        { credentials: "include", method: "DELETE" }
    );
    if (!res.ok) throw new Error("Failed to delete the subject");
    return res.json();
}

/* ---------------- PAGE ---------------- */

export default function SubjectDetailPage() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const queryClient = useQueryClient();
    const router = useRouter();

    const deleteSubjectMutation = useMutation({
        mutationFn: (subjectId: string) => deleteSubject(subjectId),

        onSuccess: () => {
            toast.success("Subject deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
            router.push("/dashboard/subjects");
        },

        onError: () => {
            toast.error("Failed to delete subject");
        },
    });


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

    const chapters: Chapter[] = chaptersData?.chapters ?? [];

    const chapterScoreQueries = useQueries({
        queries: chapters.map((chapter) => ({
            queryKey: ["chapter-score", chapter.id],
            queryFn: () => fetchChapterScore(subjectId, chapter.id),
            enabled: !!subjectId,
        })),
    });

    const isChapterScoreLoading = chapterScoreQueries.some((q) => q.isLoading);
    const isChapterScoreError = chapterScoreQueries.some((q) => q.isError);

    if (chaptersLoading || scoreLoading || isChapterScoreLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading subject data…
                </p>
            </div>
        );
    }

    if (chaptersError || scoreError || isChapterScoreError) {
        return (
            <p className="text-center text-sm text-destructive py-10">
                Failed to load subject data
            </p>
        );
    }

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
        <div className="mx-auto max-w-7xl space-y-6 px-4 mt-3">
            {/* 📊 Subject Analytics */}
            <Card>
                <CardHeader className="pb-3 flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl">
                        Subject analytics
                    </CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                Delete
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete this subject?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                    All chapters and scores under this subject will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => {
                                        deleteSubjectMutation.mutate(subjectId);
                                    }}
                                    disabled={deleteSubjectMutation.isPending}
                                >
                                    {deleteSubjectMutation.isPending ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                </CardHeader>

                <CardContent className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col items-center sm:items-start">
                        <p className="mb-1 text-sm text-muted-foreground">
                            Overall performance
                        </p>

                        {summary ? (
                            <>
                                <p className="mb-4 text-3xl font-bold tabular-nums">
                                    {summary.average_percentage ?? 0}%
                                </p>
                                <SubjectScorePie
                                    percentage={summary.average_percentage ?? 0}
                                />
                            </>
                        ) : (
                            <p className="text-muted-foreground">
                                No scores yet
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
                        {[
                            { label: "Weak", value: summary?.weak ?? 0 },
                            { label: "Average", value: summary?.average ?? 0 },
                            { label: "Strong", value: summary?.strong ?? 0 },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="rounded-lg bg-muted/50 p-3 text-center sm:text-left"
                            >
                                <p className="text-xs text-muted-foreground">
                                    {item.label}
                                </p>
                                <p className="text-lg font-semibold tabular-nums">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 📘 Chapters */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-lg sm:text-xl">
                        Chapters
                    </CardTitle>

                    <Link
                        href={`/dashboard/subjects/${subjectId}/chapters/`}
                        className="text-sm text-primary hover:underline"
                    >
                        View all →
                    </Link>
                </CardHeader>

                <CardContent>
                    {chapters.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No chapters added yet.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {chapters.map((chapter) => {
                                const level =
                                    chapterLevelMap[chapter.id] ?? "null";

                                const levelBadge = {
                                    weak: "bg-destructive/10 text-destructive",
                                    average:
                                        "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                                    strong:
                                        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                    null: "bg-muted text-muted-foreground",
                                };

                                return (
                                    <li key={chapter.id}>
                                        <Link
                                            href={`/dashboard/subjects/${subjectId}/chapters/${chapter.id}`}
                                            className="
                                                group flex items-center justify-between
                                                rounded-lg border border-border/50
                                                p-4 transition
                                                hover:bg-muted/40 hover:shadow-sm
                                                focus:outline-none focus:ring-2 focus:ring-primary
                                            "
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {chapter.name}
                                                </p>
                                                <span
                                                    className={`
                                                        mt-1 inline-block rounded-full px-2 py-0.5
                                                        text-[11px] capitalize
                                                        ${levelBadge[level]}
                                                    `}
                                                >
                                                    {level} performance
                                                </span>
                                            </div>

                                            <span className="text-muted-foreground opacity-0 transition group-hover:opacity-100">
                                                →
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
