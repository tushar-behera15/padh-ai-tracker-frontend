"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useQuery,
    useQueries,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";

/* ---------------- Types ---------------- */

type Chapter = {
    id: string;
    name: string;
};

type ChapterScore = {
    score_percentage: number;
    performance_level: "weak" | "average" | "strong";
    deadline: string;
};

/* ---------------- API ---------------- */

async function fetchChapters(subjectId: string) {
    const res = await fetch(
        `http://localhost:5000/api/subject/${subjectId}/chapters`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch chapters");
    return res.json();
}

async function fetchChapterScore(subjectId: string, chapterId: string) {
    const res = await fetch(
        `http://localhost:5000/api/subject/${subjectId}/chapters/${chapterId}/scores`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch chapter score");
    return res.json();
}

async function createChapter(subjectId: string, name: string) {
    const res = await fetch(
        `http://localhost:5000/api/subject/${subjectId}/chapters`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name }),
        }
    );
    if (!res.ok) throw new Error("Failed to create chapter");
    return res.json();
}

/* ---------------- Page ---------------- */

export default function ChaptersPage() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [chapterName, setChapterName] = useState("");

    /* 1️⃣ Fetch chapters */
    const { data, isLoading } = useQuery({
        queryKey: ["chapters", subjectId],
        queryFn: () => fetchChapters(subjectId),
        enabled: !!subjectId,
    });

    const chapters: Chapter[] = data?.chapters ?? [];

    const chapterScoreQueries = useQueries({
        queries: chapters.map((chapter) => ({
            queryKey: ["chapter-score", chapter.id],
            queryFn: () => fetchChapterScore(subjectId, chapter.id),
            enabled: !!subjectId,
        })),
    });

    const chapterScoreMap: Record<string, ChapterScore | null> = {};
    chapterScoreQueries.forEach((q, index) => {
        const chapterId = chapters[index]?.id;
        chapterScoreMap[chapterId] = q.data?.scores?.[0] ?? null;
    });

    const createMutation = useMutation({
        mutationFn: () => createChapter(subjectId, chapterName),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["chapters", subjectId],
            });
            toast.success("Chapter created successfully");
            setOpen(false);
            setChapterName("");
        },
    });

    if (isLoading) {
        return <p className="text-center py-2 text-muted-foreground">Loading chapters...</p>;
    }

    return (
        <div className="gap-4 px-4 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <h2 className="text-xl font-semibold">Chapters</h2>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Chapter
                </Button>
            </div>

            {/* Chapters List */}
            <Card className="shadow-[0_-1px_5px_rgba(0,0,0,0.1)] mt-2">

                <CardContent className="overflow-y-auto">
                    {chapters.length === 0 ? (
                        <p className="py-2 text-center text-sm text-muted-foreground">
                            No chapters added yet
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {chapters.map((chapter, index) => {
                                const score = chapterScoreMap[chapter.id];
                                const scoreQuery = chapterScoreQueries[index];
                                const isScoreLoading = scoreQuery?.isLoading ?? false;

                                const level = score
                                    ? score.performance_level
                                    : isScoreLoading
                                        ? "loading"
                                        : "none";

                                const styles = {
                                    weak: {
                                        badge: "bg-red-100 text-red-700",
                                        bar: "bg-red-500",
                                    },
                                    average: {
                                        badge: "bg-yellow-100 text-yellow-700",
                                        bar: "bg-yellow-500",
                                    },
                                    strong: {
                                        badge: "bg-green-100 text-green-700",
                                        bar: "bg-green-500",
                                    },
                                    none: {
                                        badge: "bg-gray-100 text-gray-600",
                                        bar: "bg-gray-300",
                                    },
                                    loading: {
                                        badge:
                                            "bg-muted text-muted-foreground animate-pulse",
                                        bar: "bg-muted",
                                    },
                                }[level];

                                return (
                                    <li
                                        key={chapter.id}
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/subjects/${subjectId}/chapters/${chapter.id}`
                                            )
                                        }
                                        className="group rounded-xl border bg-background p-4 cursor-pointer transition hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold">
                                                    {chapter.name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {score
                                                        ? `Deadline · ${new Date(
                                                            score.deadline
                                                        ).toLocaleDateString()}`
                                                        : "No score added yet"}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                                            >
                                                {isScoreLoading ? "Loading…" : level}
                                            </span>
                                        </div>

                                        {/* Progress */}
                                        {score || isScoreLoading ? (
                                            <div className="mt-3">
                                                {isScoreLoading ? (
                                                    <div className="space-y-2">
                                                        <div className="h-2 w-20 rounded bg-muted animate-pulse" />
                                                        <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="mb-1 flex items-center justify-between text-xs">
                                                            <span className="text-muted-foreground">Progress</span>
                                                            <span className="font-medium">
                                                                {score?.score_percentage}%
                                                            </span>
                                                        </div>

                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${styles.bar}`}
                                                                style={{ width: `${score?.score_percentage}%` }}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>


            {/* Create Chapter Dialog */}
            <Dialog
                open={open}
                onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) setChapterName("");
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Chapter</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!chapterName.trim()) return;
                            createMutation.mutate();
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="chapter">Chapter name</Label>
                            <Input
                                id="chapter"
                                value={chapterName}
                                onChange={(e) =>
                                    setChapterName(e.target.value)
                                }
                                placeholder="e.g. Measurement"
                                autoFocus
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={
                                    !chapterName.trim() ||
                                    createMutation.isPending
                                }
                            >
                                {createMutation.isPending
                                    ? "Creating..."
                                    : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
