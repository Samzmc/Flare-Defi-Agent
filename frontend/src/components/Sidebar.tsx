"use client";

import Link from "next/link";
import { QuickAction } from "@/lib/types";

const quickActions: QuickAction[] = [
  { label: "FLR Price", message: "What is the current price of FLR?", icon: "\u{1F4C8}" },
  { label: "BTC Price", message: "What is the current price of Bitcoin?", icon: "\u{1F4B0}" },
  { label: "ETH Price", message: "What is the current price of ETH?", icon: "\u{1F4B3}" },
  { label: "Random Number", message: "Generate a secure random number", icon: "\u{1F3B2}" },
  { label: "Verify Tx", message: "Verify transaction 0x4e636c6f50b2a9539e5e5c5cd3590bd3bb25637a2b1e69f4282a16a0d5a04590 on Flare", icon: "\u{1F50D}" },
  { label: "List Assets", message: "What assets are supported by the price oracle?", icon: "\u{1F4CB}" },
];

interface SidebarProps {
  onQuickAction: (message: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ onQuickAction, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gray-50 dark:bg-dark-800 border-r border-gray-200 dark:border-dark-500
          flex flex-col transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / Header */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flare-coral to-flare-coral-dark flex items-center justify-center shadow-lg shadow-flare-coral/20">
              <span className="text-lg text-white font-bold">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Flare DeFi</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">MCP Copilot</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1.5">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    onQuickAction(action.message);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-600
                    transition-colors text-left group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">
                    {action.icon}
                  </span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lottery */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Games
            </h3>
            <Link
              href="/lottery"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-600
                transition-colors group"
            >
              <span className="text-base group-hover:scale-110 transition-transform">
                🎰
              </span>
              Flare Lottery
            </Link>
          </div>

          {/* Network Info */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Network
            </h3>
            <div className="bg-gray-100 dark:bg-dark-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Coston2 Testnet</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Chain ID: 114
              </div>
            </div>
          </div>

          {/* Protocols */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Available Protocols
            </h3>
            <div className="space-y-2">
              {[
                { name: "FTSO v2", desc: "Price Oracle" },
                { name: "Secure Random", desc: "On-chain RNG" },
                { name: "FDC", desc: "Data Connector" },
              ].map((proto) => (
                <div
                  key={proto.name}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-700"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-300">{proto.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{proto.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-500">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="inline-block w-4 h-4 bg-gradient-to-r from-flare-coral to-purple-500 rounded" />
            Built with MCP
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-600 mt-1">
            ETH Oxford 2026
          </div>
        </div>
      </aside>
    </>
  );
}
