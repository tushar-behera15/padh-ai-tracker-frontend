'use client';

import Link from "next/link";
import { Clock, Zap, ArrowRight, BookOpen } from "lucide-react";

interface UpcomingRevision {
    id: string;
    subject: string;
    topic: string;
}

interface UpcomingSummaryProps {
    upcomingRevisions?: UpcomingRevision[];
}

const UpcomingSummary = ({ upcomingRevisions = [] }: UpcomingSummaryProps) => {
    const count = upcomingRevisions.length;
    const firstRevision = upcomingRevisions[0];

    return (
        <div className="rounded-2xl border p-6 bg-card">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                    Upcoming Revisions
                </h3>
            </div>

            {/* Empty state */}
            {count === 0 ? (
                <div className="text-center py-6">
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">
                        No upcoming revisions
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Add topics to stay consistent 📚
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Count */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                                {count}
                            </span>
                        </div>

                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                {count === 1
                                    ? "1 revision planned"
                                    : `${count} revisions planned`}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-primary font-medium mt-1">
                                <Zap className="h-3 w-3" />
                                Consistency builds confidence
                            </div>
                        </div>
                    </div>

                    {/* First upcoming revision */}
                    {firstRevision && (
                        <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/40">
                            <div className="p-2 rounded-md bg-primary/10">
                                <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {firstRevision.topic}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {firstRevision.subject}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Redirect */}
                    {count > 1 && (
                        <Link
                            href="/dashboard/revisions"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            View all revisions
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default UpcomingSummary;
