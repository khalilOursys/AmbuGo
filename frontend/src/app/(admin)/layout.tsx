// app/(admin)/layout.tsx
"use client";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import 'leaflet/dist/leaflet.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <AuthProvider>
      <QueryProvider>
        <ToastProvider>
          <AuthGuard>
            <div className="min-h-screen xl:flex">
              <AppSidebar />
              <Backdrop />
              <div
                className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
              >
                <AppHeader />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                  {children}
                </div>
              </div>
            </div>
          </AuthGuard>
        </ToastProvider>
      </QueryProvider>
    </AuthProvider>
  );
}