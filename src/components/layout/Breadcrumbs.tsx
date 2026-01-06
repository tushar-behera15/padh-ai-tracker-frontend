'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs() {
    const pathname = usePathname();

    const segments = pathname
        .split("/")
        .filter(Boolean)
        .slice(1); // remove "dashboard"

    if (segments.length === 0) return null;

    return (
        <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground text-xl">
                Dashboard
            </Link>

            {segments.map((segment, index) => {
                const href = "/dashboard/" + segments.slice(0, index + 1).join("/");
                const label = decodeURIComponent(segment)
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                    <span key={href} className="flex items-center">
                        <ChevronRight className="mx-2 h-5 w-5" />
                        {index === segments.length - 1 ? (
                            <span className="text-foreground text-xl">
                                {label}
                            </span>
                        ) : (
                            <Link href={href} className="hover:text-foreground text-xl">
                                {label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
