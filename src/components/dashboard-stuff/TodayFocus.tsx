import { Calendar, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Revision {
    id: string;
    subject: string;
    topic: string;
}

interface TodaysFocusProps {
    todaysRevisions: Revision[];
}

const TodaysFocus = ({ todaysRevisions }: TodaysFocusProps) => {
    return (
        <div className="rounded-2xl border p-6">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-warning" />
                <h3 className="text-lg font-semibold">Today’s Focus</h3>
            </div>

            {todaysRevisions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    🎉 No revisions scheduled today!
                </p>
            ) : (
                <div className="space-y-3">
                    {todaysRevisions.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex items-center gap-3 rounded-lg border p-3">
                            <BookOpen className="h-4 w-4 text-warning" />
                            <div>
                                <p className="font-medium">{r.topic}</p>
                                <p className="text-xs text-muted-foreground">{r.subject}</p>
                            </div>
                        </div>
                    ))}

                    <Button className="w-full mt-2">
                        View Revision Calendar
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TodaysFocus;
