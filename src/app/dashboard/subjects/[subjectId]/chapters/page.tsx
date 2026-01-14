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
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading chapters…
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <h2 className="text-xl font-semibold tracking-tight">
                    Chapters
                </h2>

                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add chapter
                </Button>
            </div>

            {/* Timeline List */}
            <Card>
                <CardContent className="relative space-y-4 py-6">
                    {/* Vertical rail */}
                    <div className="absolute left-6 top-6 bottom-6 w-px bg-border" />

                    {chapters.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">
                            No chapters added yet
                        </p>
                    ) : (
                        <ul className="space-y-5">
                            {chapters.map((chapter, index) => {
                                const score = chapterScoreMap[chapter.id];
                                const scoreQuery = chapterScoreQueries[index];
                                const isScoreLoading =
                                    scoreQuery?.isLoading ?? false;

                                const level = score
                                    ? score.performance_level
                                    : isScoreLoading
                                        ? "loading"
                                        : "none";

                                const accent = {
                                    weak: "bg-destructive",
                                    average: "bg-yellow-500",
                                    strong: "bg-emerald-500",
                                    none: "bg-muted-foreground",
                                    loading: "bg-muted",
                                }[level];

                                return (
                                    <li
                                        key={chapter.id}
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/subjects/${subjectId}/chapters/${chapter.id}`
                                            )
                                        }
                                        className="
                                            group relative ml-8 cursor-pointer
                                            rounded-xl border border-border/50
                                            bg-card p-4
                                            transition-all duration-300
                                            hover:-translate-y-0.5 hover:shadow-lg
                                            active:scale-[0.99]
                                        "
                                    >
                                        {/* Timeline dot */}
                                        <span
                                            className={`
                                                absolute -left-6.5 top-5 h-3 w-3
                                                rounded-full ${accent}
                                            `}
                                        />

                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">
                                                        {chapter.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {score
                                                            ? `Deadline · ${new Date(
                                                                score.deadline
                                                            ).toLocaleDateString()}`
                                                            : "No score added yet"}
                                                    </p>
                                                </div>

                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                                                    {isScoreLoading
                                                        ? "Loading…"
                                                        : level}
                                                </span>
                                            </div>

                                            {/* Progress rail */}
                                            {score && (
                                                <div className="pt-2">
                                                    <div className="mb-1 flex justify-between text-xs">
                                                        <span className="text-muted-foreground">
                                                            Progress
                                                        </span>
                                                        <span className="font-medium">
                                                            {score.score_percentage}%
                                                        </span>
                                                    </div>

                                                    <div className="h-1.5 w-full rounded-full bg-muted">
                                                        <div
                                                            className={`h-full rounded-full ${accent}`}
                                                            style={{
                                                                width: `${score.score_percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create chapter</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!chapterName.trim()) return;
                            createMutation.mutate();
                        }}
                        className="space-y-4 pt-2"
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
                                    ? "Creating…"
                                    : "Create chapter"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
