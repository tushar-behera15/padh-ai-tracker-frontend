'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
    scored: "#22c55e",
    remaining: "#e5e7eb",
};

interface Props {
    percentage: number; // 0–100
}

export default function SubjectPercentagePie({ percentage }: Props) {
    const safePercentage = Math.min(Math.max(percentage, 0), 100);

    const data = [
        { name: "Scored", value: safePercentage },
        { name: "Remaining", value: 100 - safePercentage },
    ];

    return (
        <div className="w-full h-50 sm:h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="65%"
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                        isAnimationActive
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl sm:text-3xl font-bold leading-none">
                    {safePercentage}%
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    Average Score
                </p>
            </div>
        </div>
    );
}
