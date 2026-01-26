import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: LucideIcon;
    variant: "success" | "danger" | "warning" | "primary";
}

const variantCard = {
    success: "border-green-500/20 bg-green-500/5",
    danger: "border-red-500/20 bg-red-500/5",
    warning: "border-yellow-500/20 bg-yellow-500/5",
    primary: "border-primary/20 bg-primary/5",
};

const variantIcon = {
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    primary: "bg-primary/10 text-primary",
};

const StatCard = ({ title, value, subtitle, icon: Icon, variant }: StatCardProps) => {
    return (
        <div className={cn("rounded-2xl border p-5", variantCard[variant])}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>

                <div className={cn("p-3 rounded-xl", variantIcon[variant])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
