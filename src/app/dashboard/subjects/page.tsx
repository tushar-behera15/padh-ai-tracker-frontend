/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import SubjectCard from "@/components/subjects/SubjectCard";
import AddSubjectDialog from "@/components/subjects/SubjectForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";

export interface Subject {
    id: string;
    name: string;
    chapterCount: number;
    pendingRevisions: number;
    scoreSummary: {
        weak: number;
        average: number;
        strong: number;
        average_percentage: number;
    };
}

export default function SubjectsPage() {
    const queryClient = useQueryClient();

    const {
        data: subjects = [],
        isLoading,
        isError,
    } = useQuery<Subject[]>({
        queryKey: ["subjects"],
        queryFn: async () => {
            const res = await fetch("/api/subject", {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch subjects");
            }

            const data = await res.json();
            const rawSubjects = Array.isArray(data.subjects) ? data.subjects : [];

            return await Promise.all(
                rawSubjects.map(async (subject: any) => {
                    let scoreSummary = {
                        weak: 0,
                        average: 0,
                        strong: 0,
                        average_percentage: 0,
                    };

                    try {
                        const scoreRes = await fetch(
                            `/api/subject/${subject.id}/scores`,
                            { credentials: "include" }
                        );

                        const scoreData = await scoreRes.json();

                        scoreSummary = {
                            weak: Number(scoreData?.summary?.weak ?? 0),
                            average: Number(scoreData?.summary?.average ?? 0),
                            strong: Number(scoreData?.summary?.strong ?? 0),
                            average_percentage: Number(
                                scoreData?.summary?.average_percentage ?? 0
                            ),
                        };
                    } catch (err) {
                        console.error(err);
                    }

                    return {
                        id: subject.id,
                        name: subject.name,
                        chapterCount: Number(subject.chapter_count ?? 0),
                        pendingRevisions: Number(subject.pending_revisions ?? 0),
                        scoreSummary,
                    };
                })
            );
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    /* -------------------- STATES -------------------- */

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">
                        Syncing your academic subjects...
                    </p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2 p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5">
                    <p className="text-sm font-bold text-rose-500 uppercase tracking-widest">
                        Data Sync Failed
                    </p>
                    <p className="text-muted-foreground text-xs">Please check your connection or try again later.</p>
                </div>
            </div>
        );
    }

    /* -------------------- UI -------------------- */

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 bg-background text-foreground lg:px-8">
            
            {/* HERO SECTION */}
            <div className="relative overflow-hidden rounded-[2.5rem] border bg-card p-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-primary/10" />
                <div className="relative rounded-[2.4rem] bg-card/50 backdrop-blur-xl p-8 md:p-12 lg:flex lg:items-center lg:justify-between">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                            <BookOpen className="h-4 w-4" />
                            Subject Repository
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                            Knowledge <span className="text-primary tracking-tighter">Stack</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Manage your academic disciplines. Add new subjects to start generating AI-powered revision strategies.
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                    <SubjectCard key={subject.id} {...subject} />
                ))}

                {/* Add Subject Card */}
                <div className="flex min-h-[300px]">
                    <AddSubjectDialog
                        onSuccess={(newSubject) => {
                            queryClient.setQueryData<Subject[]>(
                                ["subjects"],
                                (old = []) => [newSubject, ...old]
                            );
                        }}
                    />
                </div>
            </div>

            {subjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-border/60 rounded-[3rem]">
                    <div className="p-6 rounded-full bg-muted/50 text-muted-foreground">
                        <BookOpen className="h-12 w-12" />
                    </div>
                    <div>
                         <h3 className="text-xl font-bold">No subjects yet</h3>
                         <p className="text-muted-foreground">Add your first subject to begin your study journey.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
