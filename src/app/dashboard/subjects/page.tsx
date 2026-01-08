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
        staleTime: 1000 * 60 * 5, // ✅ cache for 5 minutes
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <p className="text-muted-foreground text-center">
                Loading subjects...
            </p>
        );
    }

    if (isError) {
        return (
            <p className="text-red-500 text-center">
                Failed to load subjects
            </p>
        );
    }

    return (
        <div className="space-y-6 p-3">
            <h1 className="text-2xl font-bold">Subjects</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <SubjectCard key={subject.id} {...subject} />
                ))}

                <AddSubjectDialog
                    onSuccess={(newSubject) => {
                        // ✅ Optimistic cache update
                        queryClient.setQueryData<Subject[]>(["subjects"], (old = []) => [
                            newSubject,
                            ...old,
                        ]);
                    }}
                />
            </div>
        </div>
    );
}
