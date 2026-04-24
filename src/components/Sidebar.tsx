import React from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  PieChart,
  ArrowRightLeft,
  LogOut,
  BookOpen,
  Shield,
  User,
  Briefcase,
} from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  managerRole?: "admin" | "manager" | "read_only" | "custom";
  permissions?: any;
  enableIBModule?: boolean;
  onLogout: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isAdmin,
  managerRole,
  permissions,
  enableIBModule,
  onLogout,
}: SidebarProps) {
  const hasPermission = (key: string, defaultForRole: boolean) => {
    if (managerRole === "custom" && permissions) {
      return !!permissions[key];
    }
    if (managerRole === "admin") return true;
    return defaultForRole;
  };

  const navGroups = [
    {
      group: "Manager Ecosystem",
      show: isAdmin,
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          show: true,
        },
        {
          id: "journal",
          label: "Trading Journal",
          icon: BookOpen,
          show: hasPermission("canSyncMT5", true),
        },
        {
          id: "manager_withdrawals",
          label: "Manager Wallet",
          icon: Briefcase,
          show: hasPermission(
            "canManageWithdrawals",
            managerRole !== "read_only",
          ),
        },
        {
          id: "affiliates",
          label: "IB Affiliates",
          icon: Users,
          show: enableIBModule && hasPermission("canViewAffiliates", true),
        },
        {
          id: "reports",
          label: "Reports",
          icon: PieChart,
          show: hasPermission("canViewReports", true),
        },
      ],
    },
    {
      group: "Investor Ecosystem",
      show: true,
      items: [
        {
          id: "dashboard",
          label: "My Dashboard",
          icon: LayoutDashboard,
          show: !isAdmin,
        },
        {
          id: "investors",
          label: isAdmin ? "Investor Roster" : "Statements",
          icon: Users,
          show: true,
        },
        {
          id: "transactions",
          label: "Fund Transfers",
          icon: ArrowRightLeft,
          show: isAdmin ? hasPermission("canManageTransactions", true) : true,
        },
        {
          id: "journal",
          label: "Trading Journal",
          icon: BookOpen,
          show: !isAdmin && permissions?.showTradingJournalToInvestors,
        },
      ],
    },
    {
      group: "System & Security",
      show: true,
      items: [
        {
          id: "audit",
          label: "Audit Logs",
          icon: Shield,
          show:
            isAdmin && hasPermission("canViewAudit", managerRole === "admin"),
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          show:
            isAdmin &&
            hasPermission("canManageSettings", managerRole === "admin"),
        },
        { id: "profile", label: "My Profile", icon: User, show: true },
      ],
    },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-950 text-slate-300 h-full border-r border-slate-800 shadow-xl overflow-hidden">
      <div className="flex items-center justify-center p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <PieChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              Que PAMM
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mt-1">
              Institutional
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {navGroups
          .filter((g) => g.show)
          .map((group, idx) => {
            const visibleItems = group.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-3">
                  {group.group}
                </h2>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-bold",
                          isActive
                            ? "bg-blue-600/10 text-blue-500"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-transform group-hover:scale-110",
                            isActive
                              ? "text-blue-500"
                              : "text-slate-500 group-hover:text-slate-300",
                          )}
                        />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white font-bold transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Secure Logout
        </button>
      </div>
    </div>
  );
}
