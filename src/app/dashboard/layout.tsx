'use client';

import { useState } from "react";
import AppSidebar from "@/components/dashboard-stuff/AppSidebar";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/providers/QueryProvider";
import { Toaster } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden sm:block fixed inset-y-0 left-0 w-64 border-r shadow-xl z-40">
                <AppSidebar />
            </div>

            {/* Mobile Sidebar ONLY on mobile */}
            <div className="sm:hidden">
                <AppSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>

            {/* Main Content */}
            <div className="sm:ml-64 flex min-h-screen flex-col">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <Toaster position="top-center" richColors />

                <Providers>
                    <main className="flex-1 px-3 sm:px-6 pt-0 pb-4">
                        {children}
                    </main>
                </Providers>
            </div>
        </div>
    );
}
