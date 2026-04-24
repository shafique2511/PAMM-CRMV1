import React, { useRef, useState } from "react";
import { Investor, Manager } from "../types";
import { formatCurrency, formatPercent } from "../lib/utils";
import {
  X,
  Printer,
  Download,
  Building,
  Building2,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InvoiceModalProps {
  investor: Investor;
  manager?: Manager;
  onClose: () => void;
}

export function InvoiceModal({
  investor,
  manager,
  onClose,
}: InvoiceModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Statement_${investor.investorName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF statement.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const invoiceNumber = `INV-${investor.id.toUpperCase().substring(0, 8)}-${new Date().getTime().toString().slice(-4)}`;
  const displayCurrency = investor.baseCurrency || "USD";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
        {/* Header - Hidden when printing */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 print:hidden bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Statement Details
              </h2>
              <p className="text-sm font-medium text-slate-500">
                View, print, or download financial statement
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 text-sm"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGeneratingPDF ? "Generating..." : "Save PDF"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded hover:bg-slate-50 font-bold transition-all text-sm shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <div className="w-px h-10 bg-slate-200 mx-1"></div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div
          className="p-12 overflow-y-auto print:p-0 bg-white relative print:overflow-visible"
          ref={printRef}
        >
          <div className="relative z-10 max-w-[800px] mx-auto">
            {/* Minimalist Corporate Header */}
            <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-8">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase uppercase">
                  {manager?.brandName || "Que PAMM"}
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Investment Management
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-light text-slate-400 uppercase tracking-widest leading-none">
                  Client Statement
                </h2>
                <div className="mt-4 text-xs font-mono text-slate-600">
                  <span className="text-slate-400 font-sans tracking-wide uppercase text-[10px] mr-2">
                    Ref
                  </span>
                  {invoiceNumber}
                </div>
              </div>
            </div>

            {/* Address / Info Block */}
            <div className="grid grid-cols-2 gap-12 mb-12">
              {/* To Section */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                  Prepared For
                </p>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {investor.investorName}
                </h3>
                <div className="text-sm text-slate-600 space-y-0.5">
                  {investor.email && <p>{investor.email}</p>}
                  {investor.phone && <p>{investor.phone}</p>}
                  {investor.country && <p>{investor.country}</p>}
                  {(investor.email || investor.phone || investor.country) && (
                    <div className="h-2"></div>
                  )}
                  {investor.bankAccount && (
                    <div className="mt-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Registered Payment Account:
                      </p>
                      <p className="font-mono text-xs text-slate-900">
                        {investor.bankAccount}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* From/Meta Section */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                  Statement Details
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 text-slate-500">Date Issued</td>
                      <td className="py-1 text-right font-medium text-slate-900">
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-500">Base Currency</td>
                      <td className="py-1 text-right font-medium text-slate-900">
                        {displayCurrency}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-slate-500">Account Group</td>
                      <td className="py-1 text-right font-medium text-slate-900">
                        {investor.group || "Standard"}
                      </td>
                    </tr>
                    {manager && (
                      <tr>
                        <td className="py-1 text-slate-500">Account Manager</td>
                        <td className="py-1 text-right font-medium text-slate-900">
                          {manager.name}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="mb-12">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-900 pb-1">
                Account Ledger
              </p>
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 text-slate-500 text-xs text-left">
                  <tr>
                    <th className="py-3 font-medium w-2/3">Description</th>
                    <th className="py-3 font-medium text-right relative">
                      <span className="pr-4 hidden sm:inline text-[10px] absolute right-24 top-4 text-slate-300 font-mono">
                        CCY
                      </span>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 text-slate-900 font-medium">
                      Beginning Account Balance
                    </td>
                    <td className="py-3 text-right font-mono text-slate-900">
                      {formatCurrency(
                        investor.startingCapital,
                        displayCurrency,
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-900">
                      <div className="flex flex-col">
                        <span>Gross Profit Allocation</span>
                        <span className="text-xs text-slate-400">
                          Share of pool growth (
                          {formatPercent(investor.sharePercentage)})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-900">
                      {investor.individualProfitShare > 0 ? "+" : ""}
                      {formatCurrency(
                        investor.individualProfitShare,
                        displayCurrency,
                      )}
                    </td>
                  </tr>
                  {investor.lossCarryover > 0 && (
                    <tr>
                      <td className="py-3 text-slate-900 flex items-center justify-between">
                        <span>Loss Carryover Credit Applied</span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-600">
                        -
                        {formatCurrency(
                          Math.min(
                            investor.lossCarryover,
                            Math.max(0, investor.individualProfitShare),
                          ),
                          displayCurrency,
                        )}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-3 text-slate-900">
                      <div className="flex flex-col">
                        <span>Performance Fee Deducted</span>
                        <span className="text-xs text-slate-400">
                          High Water Mark:{" "}
                          {formatCurrency(
                            investor.highWaterMark,
                            displayCurrency,
                          )}{" "}
                          / Rate: {investor.feePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-600">
                      -{formatCurrency(investor.yourFee, displayCurrency)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-y border-slate-200">
                    <td className="py-4 text-slate-900">
                      Net Profit For Period
                    </td>
                    <td className="py-4 text-right font-mono text-slate-900">
                      {investor.netProfit > 0 ? "+" : ""}
                      {formatCurrency(investor.netProfit, displayCurrency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ending Summary Block */}
            <div className="grid grid-cols-2 gap-8 mb-8 items-end">
              {/* Left side: Payouts */}
              <div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100 border-t border-b border-slate-200">
                    <tr>
                      <td className="py-2 text-slate-500 font-medium text-xs uppercase">
                        Target Reinvestment
                      </td>
                      <td className="py-2 text-right font-mono text-slate-900">
                        {formatCurrency(investor.reinvestAmt, displayCurrency)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-500 font-medium text-xs uppercase">
                        Target Cash Payout
                      </td>
                      <td className="py-2 text-right font-mono text-slate-900">
                        {formatCurrency(investor.cashPayout, displayCurrency)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right side: Final Value (Like a heavy total block) */}
              <div className="border border-slate-900 p-6 bg-slate-50 text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Final Asset Value
                </p>
                <p className="text-3xl font-mono text-slate-900 tracking-tight">
                  {formatCurrency(investor.endingCapital, displayCurrency)}
                </p>
              </div>
            </div>

            {/* Footer / Legal */}
            <div className="mt-16 pt-6 border-t border-slate-200 text-center">
              <div className="inline-flex flex-col items-center justify-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Verified Statement
                </span>
                <p className="text-xs text-slate-500">
                  This document verifies the period ending ledger values for the
                  account detailed above.
                </p>
                {manager?.supportEmail && (
                  <p className="text-xs font-mono text-slate-400 mt-2">
                    Support: {manager.supportEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
