'use client';

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Subject } from "@/app/dashboard/subjects/page";

interface AddSubjectDialogProps {
    onSuccess: (subject: Subject) => void;
}

export default function AddSubjectDialog({ onSuccess }: AddSubjectDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setName("");
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Subject name is required");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/subject/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error("Failed");

            const data = await res.json();

            const newSubject: Subject = {
                ...data.subject,
                chapterCount: 0,
                pendingRevisions: 0,
                scoreSummary: {
                    weak: 0,
                    average: 0,
                    strong: 0,
                    average_percentage: 0,
                },
            };

            onSuccess(newSubject);
            toast.success("Subject created");

            resetForm();
            setOpen(false);
        } catch {
            toast.error("Failed to create subject");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) resetForm();
            }}
        >
            <DialogTrigger asChild>
                <button
                    className="
                        group relative flex h-full min-h-55 w-full
                        flex-col items-center justify-center gap-2
                        rounded-xl border border-dashed border-border/60
                        bg-card text-muted-foreground
                        transition-all duration-300
                        hover:-translate-y-1 hover:border-primary hover:text-primary
                        hover:shadow-lg
                    "
                >
                    {/* Hover glow */}
                    <div
                        className="
                            pointer-events-none absolute inset-0
                            rounded-xl opacity-0 transition-opacity
                            group-hover:opacity-100
                            bg-linear-to-br from-primary/5 via-transparent to-primary/10
                        "
                    />

                    <Plus className="h-7 w-7" />
                    <span className="text-sm font-medium">
                        Add Subject
                    </span>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg">
                        Create subject
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Add a new subject to start tracking chapters and scores
                    </p>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                    <Input
                        placeholder="Subject name (e.g. Mathematics)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? "Creating..." : "Create subject"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
