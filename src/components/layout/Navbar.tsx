/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Breadcrumbs from "./Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { toast } from "sonner";

export default function Navbar({
    onMenuClick,
}: {
    onMenuClick?: () => void;
}) {
    const router = useRouter();

    async function handlelogout() {
        try {
            const res = await fetch(
                `/api/auth/logout`,
                { credentials: "include" }
            );
            if (!res.ok) throw new Error("Failed to Logout...");
            toast.success("User Logout successfully");
            router.push("/");
        } catch (err) {
            toast.error("Failed to logout");
        }
    }
    return (
        <header className="flex h-14 items-center justify-between border-b px-3 sm:px-6 bg-background">

            {/* Left: Hamburger + Breadcrumbs */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <Breadcrumbs />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                {/* 🌙 Dark mode toggle */}
                <ModeToggle />

                {/* 👤 User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push("/dashboard/profile")}
                        >
                            Profile
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={handlelogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
