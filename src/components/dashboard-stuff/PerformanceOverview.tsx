import { TrendingUp, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PerformanceOverviewProps {
    completionRate: number;
    totalRevisions: number;
    completedRevisions: number;
}

const PerformanceOverview = ({
    completionRate,
    totalRevisions,
    completedRevisions,
}: PerformanceOverviewProps) => {
    const insight = () => {
        if (completionRate >= 80) return "Excellent consistency 🔥";
        if (completionRate >= 60) return "Good progress 📈";
        if (completionRate >= 40) return "Needs consistency ⚠️";
        return "Let’s start small today 🚀";
    };

    return (
        <div className="rounded-2xl border p-6">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Performance Overview</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <span className="font-semibold">{completionRate}%</span>
                    </div>

                    <Progress value={completionRate} />

                    <p className="text-xs text-muted-foreground mt-1">
                        {completedRevisions} of {totalRevisions} revisions completed
                    </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-4 flex gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Brain className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground">{insight()}</p>
                </div>
            </div>
        </div>
    );
};

export default PerformanceOverview;
