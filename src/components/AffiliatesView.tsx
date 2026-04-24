import React, { useMemo } from "react";
import { Investor } from "../types";
import { formatCurrency } from "../lib/utils";
import { Users, DollarSign, Percent, Network, HelpCircle } from "lucide-react";

interface AffiliatesViewProps {
  investors: Investor[];
  currentUser?: { role: "admin" | "investor"; name: string } | null;
  isAdmin?: boolean;
}

export function AffiliatesView({
  investors,
  currentUser,
  isAdmin,
}: AffiliatesViewProps) {
  const affiliatesData = useMemo(() => {
    const ibMap = new Map<
      string,
      {
        name: string;
        referredInvestors: Investor[];
        totalCapitalReferred: number;
        totalIBCommission: number;
      }
    >();

    investors.forEach((inv) => {
      if (inv.referredBy) {
        // If not admin, only process if the referredBy matches the current user's name
        if (
          !isAdmin &&
          currentUser &&
          inv.referredBy.toLowerCase() !== currentUser.name.toLowerCase()
        ) {
          return;
        }

        const ibName = inv.referredBy;
        if (!ibMap.has(ibName)) {
          ibMap.set(ibName, {
            name: ibName,
            referredInvestors: [],
            totalCapitalReferred: 0,
            totalIBCommission: 0,
          });
        }
        const ibData = ibMap.get(ibName)!;
        ibData.referredInvestors.push(inv);
        ibData.totalCapitalReferred += inv.startingCapital;

        // Calculate commission for this period
        if (inv.yourFee > 0 && inv.ibCommissionRate) {
          ibData.totalIBCommission +=
            inv.yourFee * (inv.ibCommissionRate / 100);
        }
      }
    });

    return Array.from(ibMap.values()).sort(
      (a, b) => b.totalIBCommission - a.totalIBCommission,
    );
  }, [investors, currentUser, isAdmin]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header section identical to other modern views */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <Network className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Affiliate Network
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your Introduction Broker (IB) relationships and commission
            tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Active IBs
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {affiliatesData.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Total Network Capital
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(
                  affiliatesData.reduce(
                    (sum, ib) => sum + ib.totalCapitalReferred,
                    0,
                  ),
                )}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
              <Percent className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                IB Commissions Built
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(
                  affiliatesData.reduce(
                    (sum, ib) => sum + ib.totalIBCommission,
                    0,
                  ),
                )}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            IB Performance Matrix
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Ranked by top converting affiliates.
          </p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300">
                    Broker ID
                  </th>
                  <th className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300">
                    Client Tranches
                  </th>
                  <th className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300">
                    Sum of Referred Capital
                  </th>
                  <th className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300">
                    Generated Commission
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {affiliatesData.map((ib) => (
                  <tr
                    key={ib.name}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold uppercase ring-1 ring-emerald-200 dark:ring-emerald-800">
                          {ib.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ib.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-600 dark:text-slate-300">
                      {ib.referredInvestors.length} Investors
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-900 dark:text-white">
                      {formatCurrency(ib.totalCapitalReferred)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black tracking-wide border border-emerald-100 dark:border-emerald-800/50">
                        {formatCurrency(ib.totalIBCommission)}
                      </span>
                    </td>
                  </tr>
                ))}
                {affiliatesData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <div className="w-16 h-16 mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                          <HelpCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                          Network is Empty
                        </p>
                        <p className="font-medium max-w-sm">
                          No active Introducing Brokers found. When you assign
                          an IB flag to an investor, their aggregate stats will
                          appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
