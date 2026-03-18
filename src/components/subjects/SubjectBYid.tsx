"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import SubjectScorePie from "@/components/charts/SubjectCharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
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
import {
    ChevronLeft,
    Trash2,
    BookOpen,
    TrendingUp,
    Award,
    ChevronRight,
    Search,
    BarChart3,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";


interface Chapter {
    id: string;
    name: string;
}

type PerformanceLevel = "weak" | "average" | "strong" | "null";

/* ---------------- API FUNCTIONS ---------------- */

async function fetchChapters(subjectId: string) {
    const res = await fetch(
        `/api/subject/${subjectId}/chapters`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch chapters");
    return res.json();
}

async function fetchSubjectScore(subjectId: string) {
    const res = await fetch(
        `/api/subject/${subjectId}/scores`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch subject score summary");
    return res.json();
}

async function fetchChapterScore(subjectId: string, chapterId: string) {
    const res = await fetch(
        `/api/subject/${subjectId}/chapters/${chapterId}/scores`,
        { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch chapter score summary");
    return res.json();
}

async function deleteSubject(subjectId: string) {
    const res = await fetch(`/api/subject/${subjectId}`,
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
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">
                        Analysing subject data...
                    </p>
                </div>
            </div>
        );
    }

    if (chaptersError || scoreError || isChapterScoreError) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-center">
                <div className="max-w-xs space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-rose-500">Failed to load subject analytics</p>
                    <Button variant="outline" size="sm" onClick={() => router.refresh()}>Try Again</Button>
                </div>
            </div>
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
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-10 bg-background text-foreground lg:px-8">

            {/* NAVIGATION & ACTIONS */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="rounded-full pl-2 pr-4 text-muted-foreground hover:text-foreground"
                >
                    <Link href="/dashboard/subjects">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Stack
                    </Link>
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full text-rose-500 hover:bg-rose-500/10 hover:text-rose-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Subject
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] border-border/40 bg-card/80 backdrop-blur-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold">Delete Subject?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all chapters and scores associated with this subject. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-rose-500 text-white hover:bg-rose-600 rounded-full"
                                onClick={() => deleteSubjectMutation.mutate(subjectId)}
                                disabled={deleteSubjectMutation.isPending}
                            >
                                {deleteSubjectMutation.isPending ? "Removing..." : "Delete Permanently"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* HERO / ANALYTICS SECTION */}
            <div className="grid gap-8 lg:grid-cols-3 items-start">

                {/* OVERALL PERFORMANCE */}
                <Card className="lg:col-span-1 h-full rounded-[2.5rem] border-border/40 bg-card/60 shadow-xl backdrop-blur-md overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                            <TrendingUp className="h-3 w-3" />
                            Performance Insights
                        </div>
                        <CardTitle className="text-2xl font-bold">Subject Mastery</CardTitle>
                        <CardDescription>Based on your latest chapter scores</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-8 pb-10">
                        {summary ? (
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex flex-col items-center">
                                    <div className="text-6xl font-black tracking-tighter text-primary mb-8 underline decoration-primary/20 underline-offset-8">
                                        {summary.average_percentage ?? 0}%
                                    </div>
                                    <SubjectScorePie percentage={summary.average_percentage ?? 0} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 space-y-3">
                                <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground font-medium italic">No scores detected</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* STAT TILES & BREAKDOWN */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <PerformanceStat label="Weak Area" value={summary?.weak ?? 0} color="rose" icon={<XCircle className="h-4 w-4" />} />
                        <PerformanceStat label="Average" value={summary?.average ?? 0} color="amber" icon={<BarChart3 className="h-4 w-4" />} />
                        <PerformanceStat label="Strong Area" value={summary?.strong ?? 0} color="emerald" icon={<Award className="h-4 w-4" />} />
                    </div>

                    <Card className="rounded-[2.5rem] border-border/40 bg-card/60 shadow-xl backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-xl font-bold">Chapters Catalog</CardTitle>
                                <CardDescription>Managing {chapters.length} academic sections</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="rounded-full text-xs font-bold text-primary">
                                <Link href={`/dashboard/subjects/${subjectId}/chapters/`}>
                                    Full Catalog <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {chapters.length === 0 ? (
                                <div className="text-center py-12 rounded-[2rem] border-2 border-dashed border-border/40">
                                    <BookOpen className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                                    <p className="text-sm text-muted-foreground font-medium">No chapters indexed yet.</p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {chapters.slice(0, 6).map((chapter) => {
                                        const level = chapterLevelMap[chapter.id] ?? "null";
                                        return (
                                            <li key={chapter.id}>
                                                <Link
                                                    href={`/dashboard/subjects/${subjectId}/chapters/${chapter.id}`}
                                                    className="
                                                        group flex items-center justify-between
                                                        rounded-2xl border border-border/40
                                                        p-5 px-6 transition-all duration-300
                                                        bg-background/40 hover:bg-primary/5 hover:border-primary/40
                                                        hover:shadow-lg
                                                    "
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "p-2.5 rounded-xl transition-colors",
                                                            level === 'strong' ? "bg-emerald-500/10 text-emerald-500" :
                                                                level === 'average' ? "bg-amber-500/10 text-amber-500" :
                                                                    level === 'weak' ? "bg-rose-500/10 text-rose-500" :
                                                                        "bg-muted text-muted-foreground opacity-50"
                                                        )}>
                                                            <BookOpen className="h-5 w-5" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="font-bold group-hover:text-primary transition-colors">
                                                                {chapter.name}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "h-1.5 w-1.5 rounded-full",
                                                                    level === 'strong' ? "bg-emerald-500" :
                                                                        level === 'average' ? "bg-amber-500" :
                                                                            level === 'weak' ? "bg-rose-500" : "bg-muted"
                                                                )} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                                                                    {level !== 'null' ? `${level} Mastery` : 'No score'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        <span className="text-[10px] font-bold text-primary">MANAGE</span>
                                                        <ChevronRight className="h-4 w-4 text-primary" />
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* ---------------- HELPER COMPONENTS ---------------- */

function PerformanceStat({ label, value, color, icon }: { label: string; value: number; color: 'rose' | 'amber' | 'emerald', icon: React.ReactNode }) {
    const colors = {
        rose: "border-rose-500/10 text-rose-600 dark:text-rose-400 bg-rose-500/5",
        amber: "border-amber-500/10 text-amber-600 dark:text-amber-400 bg-amber-500/5",
        emerald: "border-emerald-500/10 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
    };

    return (
        <div className={cn("flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all hover:shadow-md", colors[color])}>
            <div className="mb-2 opacity-50">{icon}</div>
            <div className="text-3xl font-black tabular-nums">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">{label}</div>
        </div>
    );
}
