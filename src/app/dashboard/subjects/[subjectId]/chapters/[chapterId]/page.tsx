'use client';

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

interface ScoreItem {
    id: string;
    score_percentage: number;
    performance_level: "weak" | "average" | "strong";
    deadline: string;
    created_at: string;
    chapter_id: string;
    chapter_name: string;
}

interface ScoreResponse {
    message: string;
    scores: ScoreItem[];
}

const COLORS = ["#22c55e", "#ef4444"];

async function fetchChapterScore(
    subjectId: string,
    chapterId: string
): Promise<ScoreResponse> {
    const res = await fetch(
        `/api/subject/${subjectId}/chapters/${chapterId}/scores`,
        { credentials: "include" }
    );

    if (!res.ok) throw new Error("Failed to fetch score");
    return res.json();
}

export default function ChapterAnalyticsPage() {
    const { subjectId, chapterId } = useParams();
    const queryClient = useQueryClient();

    const [newScore, setNewScore] = useState("");
    const [deadline, setDeadline] = useState("");


    const [isEditing, setIsEditing] = useState(false);

    const { data, isLoading } = useQuery<ScoreResponse>({
        queryKey: ["chapter-score", subjectId, chapterId],
        queryFn: () =>
            fetchChapterScore(subjectId as string, chapterId as string),
        staleTime: 1000 * 60 * 5,
    });

    const latestScore = data?.scores?.[0] ?? null;

    const isScoreChanged =
        newScore !== "" &&
        Number(newScore) !== latestScore?.score_percentage;

    const isDeadlineChanged =
        deadline !== "" &&
        deadline !== latestScore?.deadline?.split("T")[0];

    const hasChanges = isScoreChanged || isDeadlineChanged;



    /** ADD SCORE */
    const addScoreMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(
                `/api/subject/${subjectId}/chapters/${chapterId}/scores`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        score_percentage: Number(newScore),
                        deadline: new Date(deadline!).toISOString(),
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to add score");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Score & deadline added successfully 🎉");
            queryClient.invalidateQueries({
                queryKey: ["chapter-score", subjectId, chapterId],
            });
            setNewScore("");
            setDeadline("");
        },
        onError: () => toast.error("Failed to save score. Try again."),
    });

    /** UPDATE SCORE */
    const updateScoreMutation = useMutation({
        mutationFn: async () => {
            if (!latestScore) return;

            const payload = {
                score_percentage: isScoreChanged
                    ? Number(newScore)
                    : latestScore.score_percentage,
                deadline: isDeadlineChanged
                    ? new Date(deadline!).toISOString()
                    : latestScore.deadline,
            };

            const res = await fetch(
                `/subject/${subjectId}/chapters/${chapterId}/scores/${latestScore.id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) throw new Error("Failed to update score");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Score updated successfully ✨");
            queryClient.invalidateQueries({
                queryKey: ["chapter-score", subjectId, chapterId],
            });
            setIsEditing(false);
        },
    });


    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading Analytics....
                </p>
            </div>
        );
    }

    const score = latestScore?.score_percentage ?? null;
    const performanceLevel = latestScore?.performance_level ?? "not-evaluated";

    const deadlineDate = latestScore
        ? new Date(latestScore.deadline)
        : null;

    const today = new Date();
    const daysLeft = deadlineDate
        ? Math.max(
            Math.ceil(
                (deadlineDate.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            0
        )
        : 0;

    const performanceColor =
        performanceLevel === "strong"
            ? "bg-green-500/15 text-green-600 dark:text-green-400"
            : performanceLevel === "average"
                ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                : performanceLevel === "weak"
                    ? "bg-red-500/15 text-red-600 dark:text-red-400"
                    : "bg-muted text-muted-foreground";


    const pieData = [
        { name: "Days Left", value: daysLeft },
        { name: "Days Used", value: Math.max(30 - daysLeft, 0) },
    ];

    return (
        <div className="mx-auto max-w-7xl px-6 py-8 space-y-10 bg-background text-foreground">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-3xl border bg-card p-8">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

                <div className="relative">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {latestScore?.chapter_name ?? "Chapter Analytics"}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                        Track your performance, manage deadlines, and improve strategically.
                    </p>
                </div>
            </div>


            {/* STATS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                            Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-4xl font-semibold">
                        {score !== null ? `${score}%` : "—"}
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                            Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={`capitalize px-3 py-1 ${performanceColor}`}>
                            {performanceLevel}
                        </Badge>

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                            Days Left
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-4xl font-bold">
                        {daysLeft}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                            Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        {score === null
                            ? "Add score to unlock insights"
                            : score < 40
                                ? "⚠️ High priority chapter"
                                : score < 70
                                    ? "📈 Needs focused practice"
                                    : "🔥 On track"}
                    </CardContent>
                </Card>
            </div>

            {score !== null && !isEditing && (
                <Button
                    variant="outline"
                    disabled={updateScoreMutation.isPending}
                    onClick={() => {
                        if (latestScore) {
                            setNewScore(String(latestScore.score_percentage));
                            setDeadline(latestScore.deadline.split("T")[0]);
                        }
                        setIsEditing(true);
                    }}
                >
                    Edit Score & Deadline
                </Button>

            )}
            {/* ADD / UPDATE */}
            {(score === null || isEditing) && (
                <Card className="rounded-2xl border bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {score === null ? "Add Score & Deadline" : "Update Progress"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Keep this chapter up to date for accurate insights.
                        </p>
                    </CardHeader>

                    <CardContent className="grid gap-5">
                        <div className="grid gap-2">
                            <Label>Score (%)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 65"
                                value={newScore}
                                onChange={(e) => setNewScore(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Target Completion Date</Label>
                            <Input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>

                        <Button
                            size="lg"
                            className="mt-2"
                            disabled={
                                addScoreMutation.isPending ||
                                updateScoreMutation.isPending ||
                                (score !== null && !hasChanges)
                            }
                            onClick={() => {
                                if (score === null) {
                                    addScoreMutation.mutate();
                                } else {
                                    updateScoreMutation.mutate();
                                }
                            }}
                        >
                            {updateScoreMutation.isPending
                                ? "Updating..."
                                : score === null
                                    ? "Save Progress"
                                    : "Update Progress"}
                        </Button>

                    </CardContent>
                </Card>

            )}



            {/* ANALYTICS */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Performance Meter</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Visual representation of your current mastery
                        </p>
                    </CardHeader>

                    <CardContent className="flex flex-col justify-center h-full space-y-6">
                        <div className="relative">
                            {/* Gradient bar */}
                            <div className="h-3 rounded-full bg-linear-to-r from-red-500 via-yellow-400 to-green-500" />

                            {/* Marker */}
                            <div
                                className="absolute -top-2"
                                style={{ left: `${score ?? 0}%` }}
                            >
                                <div className="w-4 h-4 rounded-full bg-background border shadow" />
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Weak</span>
                            <span>Average</span>
                            <span>Strong</span>
                        </div>
                    </CardContent>
                </Card>




                <Card className="relative rounded-2xl">
                    <CardHeader>
                        <CardTitle>Deadline Timeline</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Remaining time until your target date
                        </p>
                    </CardHeader>

                    <CardContent className="h-72 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    innerRadius={70}
                                    outerRadius={100}
                                    stroke="none"
                                >
                                    {pieData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-semibold">{daysLeft}</span>
                            <span className="text-xs text-muted-foreground">
                                days remaining
                            </span>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
