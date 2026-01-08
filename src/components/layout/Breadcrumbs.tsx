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

    const lastSegment = segments[segments.length - 1];
    const currentLabel = decodeURIComponent(lastSegment)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <nav
            className="flex items-center text-muted-foreground max-w-[70vw] sm:max-w-none"
            aria-label="Breadcrumb"
        >
            {/* Desktop: full breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm">
                <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                </Link>

                {segments.map((segment, index) => {
                    const href =
                        "/dashboard/" + segments.slice(0, index + 1).join("/");

                    const label = decodeURIComponent(segment)
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());

                    return (
                        <span key={href} className="flex items-center">
                            <ChevronRight className="mx-2 h-4 w-4" />
                            {index === segments.length - 1 ? (
                                <span className="text-foreground font-medium">
                                    {label}
                                </span>
                            ) : (
                                <Link href={href} className="hover:text-foreground">
                                    {label}
                                </Link>
                            )}
                        </span>
                    );
                })}
            </div>

            {/* Mobile: current page only */}
            <div className="flex sm:hidden items-center gap-2 text-sm font-medium text-foreground truncate">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="truncate max-w-[50vw]">
                    {currentLabel}
                </span>
            </div>
        </nav>
    );
}
