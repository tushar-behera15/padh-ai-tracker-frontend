'use client';

import { useMemo, useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Sparkles,
    BookOpen
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */

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
    const res = await fetch("/api/revision", {
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch revisions");
    return res.json();
}

/* ---------------- HELPERS ---------------- */

function toDateKey(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
    ].join("-");
}

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
    const [open, setOpen] = useState(false);
    const [activeRevision, setActiveRevision] =
        useState<Revision | null>(null);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<RevisionResponse>({
        queryKey: ["revisions"],
        queryFn: fetchRevisions,
        staleTime: 1000 * 60 * 5,
    });

    const markCompletedMutation = useMutation({
        mutationFn: async (revisionId: string) => {
            const res = await fetch(
                `/api/revision/${revisionId}/completed`,
                {
                    method: "PUT",
                    credentials: "include",
                }
            );

            if (!res.ok) throw new Error("Failed to mark revision as completed");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Revision completed!", {
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            });
            queryClient.invalidateQueries({ queryKey: ["revisions"] });
            setOpen(false);
            setActiveRevision(null);
        },
        onError: () => {
            toast.error("Failed to update revision");
        },
    });

    const revisionsByDate = useMemo(() => {
        const map: Record<string, Revision[]> = {};
        data?.revisions.forEach((rev) => {
            const key = toDateKey(new Date(rev.revision_date));
            if (!map[key]) map[key] = [];
            map[key].push(rev);
        });
        return map;
    }, [data]);

    const today = normalizeDate(new Date());

    function isPastDateWithoutRevision(date: Date) {
        const key = toDateKey(date);
        const hasRevision = !!revisionsByDate[key];
        return normalizeDate(date) < today && !hasRevision;
    }

    const selectedKey = selectedDate ? toDateKey(selectedDate) : "";
    const selectedRevisions = revisionsByDate[selectedKey] || [];

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">
                        Loading your schedule...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 bg-background text-foreground lg:px-8">

            {/* HERO SECTION */}
            <div className="relative overflow-hidden rounded-[2.5rem] border bg-card p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-primary/10" />
                <div className="relative rounded-[2.4rem] bg-card/50 backdrop-blur-xl p-8 md:p-12">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                            <CalendarIcon className="h-4 w-4" />
                            Active Planner
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                            Revision <span className="text-primary tracking-tighter">Timeline</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Visualise your study journey. Complete pending tasks to maintain your academic momentum.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
                {/* CALENDAR COLUMN */}
                <div className="space-y-6">
                    <Card className="rounded-3xl border-border/40 bg-card/60 shadow-xl backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Select Date</CardTitle>
                            <CardDescription>View scheduled chapters</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-8 p-3">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={isPastDateWithoutRevision}
                                className="rounded-2xl border bg-background/40 p-3"
                                modifiers={{
                                    hasRevision: (date) => !!revisionsByDate[toDateKey(date)],
                                    missed: (date) => {
                                        const revisions = revisionsByDate[toDateKey(date)];
                                        if (!revisions) return false;
                                        return revisions.some(r => !r.completed && normalizeDate(new Date(r.revision_date)) < today);
                                    },
                                }}
                                modifiersClassNames={{
                                    hasRevision: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary",
                                    missed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold underline decoration-rose-500/30",
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* LEGEND */}
                    <Card className="rounded-2xl border-border/40 bg-card/40 p-4 space-y-3">
                        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase tracking-widest px-2">Legend</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span>Revision Due</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 rounded-full bg-rose-500" />
                                <span>Missed Day</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* REVISION LIST COLUMN */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {selectedDate?.toLocaleDateString(undefined, {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                })}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {selectedRevisions.length} {selectedRevisions.length === 1 ? 'task' : 'tasks'} scheduled
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {selectedRevisions.length === 0 ? (
                            <Card className="rounded-[2rem] border-dashed border-2 py-20 bg-card/20 border-border/60">
                                <div className="text-center space-y-3">
                                    <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">Rest day! No revisions scheduled.</p>
                                </div>
                            </Card>
                        ) : (
                            selectedRevisions.map((rev) => {
                                const status = getRevisionStatus(rev);
                                return (
                                    <Card
                                        key={rev.id}
                                        onClick={() => {
                                            if (status === "completed") return;
                                            setActiveRevision(rev);
                                            setOpen(true);
                                        }}
                                        className={cn(
                                            "group relative overflow-hidden rounded-[1.5rem] p-6 transition-all border-border/40",
                                            status !== "completed" ? "cursor-pointer hover:bg-muted/40 hover:shadow-lg hover:border-primary/50" : "opacity-80 bg-emerald-500/5",
                                            status === "missed" && "bg-rose-500/5 border-rose-500/20"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-2xl",
                                                    status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                                                        status === "missed" ? "bg-rose-500/10 text-rose-500" :
                                                            "bg-primary/10 text-primary"
                                                )}>
                                                    <BookOpen className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{rev.chapter_name}</h3>
                                                    <p className="text-sm text-muted-foreground">{rev.subject_name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge className={cn(
                                                    "rounded-full px-4 py-1 text-xs font-bold",
                                                    status === "completed" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                                        status === "missed" ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" :
                                                            "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                                )}>
                                                    {status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                                                    {status === "missed" && <AlertCircle className="h-3 w-3 mr-1 inline" />}
                                                    {status}
                                                </Badge>
                                                {status !== "completed" && <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* COMPLETION DIALOG */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-[2rem] sm:max-w-md border-border/40 bg-card/80 backdrop-blur-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Complete Revision</DialogTitle>
                        <DialogDescription>Verify you&apos;ve mastered the material for this chapter.</DialogDescription>
                    </DialogHeader>

                    {activeRevision && (
                        <div className="space-y-6 pt-4">
                            <div className="rounded-2xl bg-muted p-4 border border-border/40 space-y-1">
                                <h3 className="font-bold text-lg">{activeRevision.chapter_name}</h3>
                                <p className="text-sm text-muted-foreground">{activeRevision.subject_name}</p>
                            </div>

                            <p className="text-sm text-center px-4 leading-relaxed italic">
                                &quot;Success is the sum of small efforts, repeated day in and day out.&quot;
                            </p>

                            <DialogFooter className="gap-3 sm:justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    className="rounded-full px-8"
                                >
                                    Not Yet
                                </Button>
                                <Button
                                    className="rounded-full px-8 font-bold"
                                    disabled={markCompletedMutation.isPending}
                                    onClick={() => markCompletedMutation.mutate(activeRevision.id)}
                                >
                                    {markCompletedMutation.isPending ? "Updating..." : "Confirm Mastery"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
