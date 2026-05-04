"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Users, Stethoscope, BarChart3,
  Settings, LogOut, Bot, X, Bell, Shield, Clock, CalendarPlus,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const userNav = [
  { path: "/dashboard",               icon: LayoutDashboard, label: "Dashboard"        },
  { path: "/dashboard/appointments",  icon: Calendar,        label: "My Appointments"  },
  { path: "/dashboard/book",          icon: CalendarPlus,    label: "Book Appointment" },
  { path: "/dashboard/ai-chat",       icon: Bot,             label: "AI Receptionist"  },
  { path: "/dashboard/notifications", icon: Bell,            label: "Notifications"    },
  { path: "/dashboard/settings",      icon: Settings,        label: "Settings"         },
];

const adminNav = [
  { path: "/admin",               icon: LayoutDashboard, label: "Dashboard"         },
  { path: "/admin/appointments",  icon: Calendar,        label: "Appointments"      },
  { path: "/admin/book",          icon: CalendarPlus,    label: "Book Appointment", highlight: true },
  { path: "/admin/doctors",       icon: Stethoscope,     label: "Doctors"           },
  { path: "/admin/users",         icon: Users,           label: "Patients"          },
  { path: "/admin/analytics",     icon: BarChart3,       label: "Analytics"         },
  { path: "/admin/schedule",      icon: Clock,           label: "Schedules"         },
  { path: "/admin/settings",      icon: Settings,        label: "Settings"          },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin  = user?.role === "admin";
  const navItems = isAdmin ? adminNav : userNav;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-40",
        "transition-transform duration-300 shadow-xl",
        "lg:static lg:translate-x-0 lg:shadow-none lg:flex-shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-sm leading-tight">MediCare AI</h1>
            <p className="text-xs text-gray-400">{isAdmin ? "Admin Panel" : "Patient Portal"}</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin badge */}
        {isAdmin && (
          <div className="mx-4 mt-3 px-3 py-2 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <span className="text-xs font-medium text-violet-700">Administrator Access</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path ||
              (item.path !== "/dashboard" &&
               item.path !== "/admin" &&
               pathname.startsWith(item.path));

            if (item.highlight && !isActive) {
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all
                    bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 my-1"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all group",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600",
                )} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-gray-50">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {getInitials(user?.name || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-gray-600
              hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-sm font-medium group"
          >
            <LogOut className="w-4 h-4 group-hover:text-red-500" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
