"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, CalendarCheck, BarChart3 } from "lucide-react";

const features = [
    {
        title: "Smart Analysis",
        description:
            "AI analyzes your test performance and identifies weak chapters automatically.",
        icon: Brain,
        gradient: "from-indigo-500/10 to-purple-500/10",
    },
    {
        title: "Auto Revision Plan",
        description:
            "Never forget what you studied. Get revision reminders exactly when needed.",
        icon: CalendarCheck,
        gradient: "from-pink-500/10 to-rose-500/10",
    },
    {
        title: "Track Progress",
        description:
            "Visual insights help you see improvement and stay motivated every day.",
        icon: BarChart3,
        gradient: "from-green-500/10 to-emerald-500/10",
    },
];

export default function HomeCarousel() {
    return (
        <section className="relative bg-background py-10">
            <div className="mx-auto max-w-7xl px-6">
                {/* Heading */}
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold sm:text-4xl">
                        Why students love{" "}
                        <span className="text-primary">Padh-AI-Tracker</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                        Built for consistency, clarity, and confidence in your preparation.
                    </p>
                </div>

                {/* Carousel */}
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="relative"
                >
                    <CarouselContent className="-ml-4">
                        {features.map((item, index) => (
                            <CarouselItem
                                key={index}
                                className="pl-4 sm:basis-1/2 lg:basis-1/3"
                            >
                                <Card className="h-full rounded-3xl border shadow-sm hover:shadow-lg transition">
                                    <CardContent className="p-6">
                                        <div
                                            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${item.gradient}`}
                                        >
                                            <item.icon className="h-6 w-6 text-primary" />
                                        </div>

                                        <h3 className="text-lg font-semibold">
                                            {item.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Controls */}
                    <CarouselPrevious className="-left-4 hidden md:flex" />
                    <CarouselNext className="-right-4 hidden md:flex" />
                </Carousel>
            </div>
        </section>
    );
}
