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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
    const res = await fetch("http://localhost:5000/api/revision", {
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch revisions");
    return res.json();
}

/* ---------------- HELPERS ---------------- */

// Always use LOCAL date key (never toISOString)
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

    /* -------- Fetch revisions -------- */

    const { data, isLoading } = useQuery<RevisionResponse>({
        queryKey: ["revisions"],
        queryFn: fetchRevisions,
        staleTime: 1000 * 60 * 5,
    });

    /* -------- Mark completed -------- */

    const markCompletedMutation = useMutation({
        mutationFn: async (revisionId: string) => {
            const res = await fetch(
                `http://localhost:5000/api/revision/${revisionId}/completed`,
                {
                    method: "PUT",
                    credentials: "include",
                }
            );

            if (!res.ok) {
                throw new Error("Failed to mark revision as completed");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("Revision marked as completed ✅");
            queryClient.invalidateQueries({ queryKey: ["revisions"] });
            setOpen(false);
            setActiveRevision(null);
        },
        onError: () => {
            toast.error("Failed to update revision");
        },
    });

    /* -------- Group revisions by date -------- */

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

    /* -------- Calendar rules -------- */

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
                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading your Revisions....
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-8 space-y-10 bg-background text-foreground">

            {/* HERO */}
            <div className="relative overflow-hidden rounded-3xl border bg-card p-8">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />

                <div className="relative">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Revision Calendar
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                        Visual overview of completed, pending, and missed study revisions.
                    </p>
                </div>
            </div>


            <div className="grid gap-8 lg:grid-cols-[420px_1fr] items-start">

                {/* CALENDAR */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                    </CardHeader>

                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={isPastDateWithoutRevision}
                            className="rounded-md border"
                            modifiers={{
                                hasRevision: (date) =>
                                    !!revisionsByDate[toDateKey(date)],
                                missed: (date) => {
                                    const revisions =
                                        revisionsByDate[toDateKey(date)];
                                    if (!revisions) return false;

                                    return revisions.some(
                                        (r) =>
                                            !r.completed &&
                                            normalizeDate(
                                                new Date(r.revision_date)
                                            ) < today
                                    );
                                },
                            }}
                            modifiersClassNames={{
                                hasRevision:
                                    "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary",
                                missed:
                                    "bg-red-500/10 text-red-600 dark:text-red-400 font-medium",
                            }}
                        />
                    </CardContent>
                </Card>

                {/* REVISION LIST */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {selectedDate
                                ? selectedDate.toLocaleDateString(undefined, {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                })
                                : "Select a date"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Scheduled revisions for the selected day
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {selectedRevisions.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-muted-foreground">
                                    No revisions scheduled for this day 📭
                                </p>
                            </div>
                        ) : (
                            selectedRevisions.map((rev) => {
                                const status = getRevisionStatus(rev);

                                return (
                                    <div
                                        key={rev.id}
                                        onClick={() => {
                                            if (status === "completed") return;
                                            setActiveRevision(rev);
                                            setOpen(true);
                                        }}
                                        className={cn(
                                            "rounded-xl border p-4 transition",
                                            status !== "completed" &&
                                            "cursor-pointer hover:shadow-md hover:border-primary/40",
                                            status === "completed" &&
                                            "opacity-70 cursor-not-allowed bg-green-500/5 border-green-500/20",
                                            status === "pending" &&
                                            "bg-background",
                                            status === "missed" &&
                                            "bg-red-500/5 border-red-500/30"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h3 className="font-medium">
                                                    {rev.chapter_name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {rev.subject_name}
                                                </p>
                                            </div>

                                            <Badge
                                                className={cn(
                                                    "capitalize px-3 py-1 text-xs",
                                                    status === "completed" &&
                                                    "bg-green-500/15 text-green-600 dark:text-green-400",
                                                    status === "pending" &&
                                                    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
                                                    status === "missed" &&
                                                    "bg-red-500/15 text-red-600 dark:text-red-400"
                                                )}
                                            >
                                                {status}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* DIALOG (ONLY ONCE) */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Revision</DialogTitle>
                    </DialogHeader>

                    {activeRevision && (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-3">
                                <h3 className="font-medium">
                                    {activeRevision.chapter_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {activeRevision.subject_name}
                                </p>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Mark this revision as completed?
                            </p>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    disabled={
                                        activeRevision.completed ||
                                        markCompletedMutation.isPending
                                    }
                                    onClick={() =>
                                        markCompletedMutation.mutate(
                                            activeRevision.id
                                        )
                                    }
                                >
                                    {markCompletedMutation.isPending
                                        ? "Updating..."
                                        : activeRevision.completed
                                            ? "Already Completed"
                                            : "Mark as Completed"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
