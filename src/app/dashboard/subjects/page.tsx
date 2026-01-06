/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from "react";
import SubjectCard from "@/components/subjects/SubjectCard";
import AddSubjectDialog from "@/components/subjects/SubjectForm";

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
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubjects = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/subject", {
                credentials: "include",
            });

            const data = await res.json();

            const subjectsWithScores: Subject[] = await Promise.all(
                data.subjects.map(async (subject: any) => {
                    try {
                        const scoreRes = await fetch(
                            `http://localhost:5000/api/subject/${subject.id}/scores`,
                            { credentials: "include" }
                        );
                        const scoreData = await scoreRes.json();

                        return {
                            ...subject,
                            scoreSummary: {
                                weak: Number(scoreData?.summary?.weak ?? 0),
                                average: Number(scoreData?.summary?.average ?? 0),
                                strong: Number(scoreData?.summary?.strong ?? 0),
                                average_percentage: Number(
                                    scoreData?.summary?.average_percentage ?? 0
                                ),
                            },
                        };
                    } catch {
                        return {
                            ...subject,
                            scoreSummary: {
                                weak: 0,
                                average: 0,
                                strong: 0,
                                average_percentage: 0,
                            },
                        };
                    }
                })
            );

            setSubjects(subjectsWithScores);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    if (loading) {
        return <p className="text-muted-foreground text-center">Loading subjects...</p>;
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
                        setSubjects((prev) => [newSubject, ...prev]);
                    }}
                />
            </div>
        </div>
    );
}
