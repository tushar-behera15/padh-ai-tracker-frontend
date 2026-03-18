'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Layers, TrendingUp, ChevronRight, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
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

export default function SubjectCard({
    id,
    name,
    chapterCount,
    pendingRevisions,
    scoreSummary,
}: SubjectCardProps) {
    const progress = scoreSummary?.average_percentage ?? 0;

    return (
        <Link href={`/dashboard/subjects/${id}`} className="group block h-full">
            <Card
                className="
                    relative flex h-full flex-col cursor-pointer overflow-hidden
                    rounded-[2rem] border-border/40 bg-card/60 shadow-xl backdrop-blur-md
                    transition-all duration-500
                    hover:-translate-y-2 hover:shadow-2xl hover:border-primary/50
                    active:scale-[0.98]
                "
            >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target className="h-20 w-20 text-primary rotate-12" />
                </div>

                <CardHeader className="relative space-y-4 pb-0 pt-8 px-8 text-center sm:text-left">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                            <CardTitle className="truncate text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                {name}
                            </CardTitle>
                            <div className="flex items-center justify-center sm:justify-start gap-3">
                                <BadgeSmall icon={<Layers className="h-3 w-3" />} text={`${chapterCount} Chapters`} />
                                <BadgeSmall icon={<Clock className="h-3 w-3" />} text={`${pendingRevisions} Pending`} />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative flex flex-1 flex-col justify-between p-8 pt-6 space-y-6">
                    {/* Progress Section */}
                    <div className="space-y-3">
                        <div className="flex items-end justify-between">
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Current Mastery</span>
                                <div className="text-3xl font-black tracking-tighter text-foreground decoration-primary/30 underline-offset-4 decoration-2">
                                    {progress}%
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <TrendingUp className={cn("h-5 w-5", progress >= 75 ? "text-emerald-500" : "text-amber-500")} />
                                <span className={cn("text-[10px] font-bold uppercase", progress >= 75 ? "text-emerald-500" : "text-amber-500")}>
                                    {progress >= 75 ? 'Mastered' : 'Growing'}
                                </span>
                            </div>
                        </div>
                        <Progress value={progress} className="h-2.5 rounded-full bg-muted shadow-inner" />
                    </div>

                    {/* Stats Breakdown */}
                    <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-2xl border border-border/40 bg-background/40 p-1">
                        <StatItem label="Weak" value={scoreSummary.weak} color="rose" />
                        <StatItem label="Avg" value={scoreSummary.average} color="amber" />
                        <StatItem label="Strong" value={scoreSummary.strong} color="emerald" />
                    </div>

                    {/* Action Indicator */}
                    <div className="flex items-center justify-center pt-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        View Analytics <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function StatItem({ label, value, color }: { label: string; value: number; color: 'rose' | 'amber' | 'emerald' }) {
    const colors = {
        rose: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    };

    return (
        <div className={cn("flex flex-col items-center justify-center py-3 rounded-xl transition-colors", colors[color])}>
            <span className="text-lg font-bold tabular-nums leading-none mb-1">{value}</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</span>
        </div>
    );
}

function BadgeSmall({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            {icon}
            <span>{text}</span>
        </div>
    );
}
