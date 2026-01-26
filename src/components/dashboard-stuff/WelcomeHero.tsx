import { Sparkles } from "lucide-react";

interface WelcomeHeroProps {
    userName: string;
    completionRate: number;
}

const WelcomeHero = ({ userName, completionRate }: WelcomeHeroProps) => {
    const getMotivation = () => {
        if (completionRate >= 90) return "You're crushing it! Keep going 🔥";
        if (completionRate >= 70) return "Great progress! Stay consistent 💪";
        if (completionRate >= 50) return "Good effort! Keep building momentum 📚";
        if (completionRate >= 30) return "Every revision counts 🌱";
        return "Let’s get started on your journey 🚀";
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border bg-card p-8">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm opacity-80">Padh-AI-Tracker</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Welcome back, {userName}! 👋
                </h1>

                <p className="opacity-90 max-w-xl">
                    {getMotivation()}
                </p>
            </div>
        </div>
    );
};

export default WelcomeHero;
