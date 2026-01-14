/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import SubjectCard from "@/components/subjects/SubjectCard";
import AddSubjectDialog from "@/components/subjects/SubjectForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
            const res = await fetch("http://localhost:5000/api/subject", {
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
                            `http://localhost:5000/api/subject/${subject.id}/scores`,
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
                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading your subjects…
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-sm font-medium text-red-500 dark:text-red-400">
                    Failed to load subjects
                </p>
            </div>
        );
    }

    /* -------------------- UI -------------------- */

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Subjects
                </h1>
                <p className="text-sm text-muted-foreground">
                    Track chapters, revisions, and performance at a glance
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                    <SubjectCard key={subject.id} {...subject} />
                ))}

                {/* Add Subject Card */}
                <div className="flex">
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
        </div>
    );
}
