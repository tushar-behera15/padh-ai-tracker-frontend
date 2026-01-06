'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    RotateCcw,
    User,
} from "lucide-react";

const links = [
    {
        name: "Dashboard",
        href: "/dashboard",
        exact: true,
        icon: LayoutDashboard,
    },
    {
        name: "Subjects",
        href: "/dashboard/subjects",
        icon: BookOpen,
    },
    {
        name: "Revisions",
        href: "/dashboard/revisions",
        icon: RotateCcw,
    },
    {
        name: "Profile",
        href: "/dashboard/profile",
        icon: User,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <nav className="p-4 space-y-2">
            {links.map((link) => {
                const isActive = link.exact
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(link.href + "/");


                const Icon = link.icon;

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Icon size={18} />
                        {link.name}
                    </Link>
                );
            })}
        </nav>
    );
}
