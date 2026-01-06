'use client';

import Breadcrumbs from "./Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();

    const handleLogout = async () => {
        // optional: call backend logout
        router.push("/login");
    };

    return (
        <header className="flex h-14 items-center justify-between border-b px-6 bg-background">
            {/* Breadcrumbs */}
            <Breadcrumbs />

            {/* Right actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
