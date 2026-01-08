'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    RotateCcw,
    User,
    X,
} from "lucide-react";

interface SidebarProps {
    open?: boolean;
    onClose?: () => void;
}

export default function AppSidebar({ open = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/dashboard", exact: true, icon: LayoutDashboard },
        { name: "Subjects", href: "/dashboard/subjects", icon: BookOpen },
        { name: "Revisions", href: "/dashboard/revisions", icon: RotateCcw },
        { name: "Profile", href: "/dashboard/profile", icon: User },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 sm:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed sm:static inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-200",
                    open ? "translate-x-0" : "-translate-x-full",
                    "sm:translate-x-0"
                )}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 sm:hidden">
                    <span className="font-semibold">Menu</span>
                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

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
                                onClick={onClose}
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
            </aside>
        </>
    );
}
