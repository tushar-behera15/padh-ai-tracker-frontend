import AppSidebar from "@/components/dashboard-stuff/AppSidebar";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "sonner";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className="flex min-h-screen">
                <aside className="w-64 border-r bg-background shadow-xl">

                    <AppSidebar />
                </aside>
                <main className="flex-1">
                    <Navbar />
                    <Toaster position="top-center" richColors />
                    {children}
                </main>
            </div>

        </>

    );
}