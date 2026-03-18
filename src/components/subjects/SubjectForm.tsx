/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubjectFormProps {
    onSuccess: (newSubject: any) => void;
}

export default function AddSubjectDialog({ onSuccess }: SubjectFormProps) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await fetch("/api/subject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to add subject");
            }

            return res.json();
        },
        onSuccess: (data) => {
            toast.success(`${name} added to your stack!`);
            onSuccess(data.subject);
            setOpen(false);
            setName("");
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        mutation.mutate(name.trim());
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="
                        group flex h-full w-full flex-col items-center justify-center gap-4
                        rounded-[2rem] border-2 border-dashed border-border/60
                        bg-card/40 transition-all duration-300
                        hover:bg-primary/5 hover:border-primary/50 hover:shadow-xl
                        text-muted-foreground hover:text-primary
                    "
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
                        <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="text-sm font-bold uppercase tracking-widest">Add Subject</p>
                        <p className="text-[10px] opacity-70">Expand your knowledge stack</p>
                    </div>
                </Button>
            </DialogTrigger>

            <DialogContent className="rounded-[2.5rem] border-border/40 bg-card/80 backdrop-blur-2xl sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <BookOpen className="h-7 w-7 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center">New Subject</DialogTitle>
                    <DialogDescription className="text-center">
                        Create a new category for your study materials.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2 px-1">
                        <Label htmlFor="subject-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Subject Title
                        </Label>
                        <div className="relative">
                            <Input
                                id="subject-name"
                                placeholder="e.g. Advanced Mathematics"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 rounded-2xl bg-background/60 pl-11 border-border/40 focus-visible:ring-primary/30"
                                autoFocus
                            />
                            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="w-full h-12 rounded-2xl font-bold text-sm group"
                            disabled={mutation.isPending || !name.trim()}
                        >
                            {mutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Initialising...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Finalise Subject
                                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
