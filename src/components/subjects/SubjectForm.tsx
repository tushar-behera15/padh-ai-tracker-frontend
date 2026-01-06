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

            // ✅ Optimistic subject object
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
                <button className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-muted-foreground hover:border-primary hover:text-primary transition">
                    <Plus className="h-6 w-6" />
                    <span>Add Subject</span>
                </button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Subject</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        placeholder="Subject name (e.g. Maths)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Creating..." : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
