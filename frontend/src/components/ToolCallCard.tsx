"use client";

import { ToolCall } from "@/lib/types";

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function PriceCard({ toolCall }: { toolCall: ToolCall }) {
  const output = toolCall.output as {
    symbol: string;
    price: number;
    timestamp: number;
    source: string;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{output.symbol}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-600 px-2 py-0.5 rounded">
          {output.source}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        ${output.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        Updated {formatTimestamp(output.timestamp)}
      </div>
    </div>
  );
}

function RandomCard({ toolCall }: { toolCall: ToolCall }) {
  const output = toolCall.output as {
    randomNumber: number;
    range: number;
    isSecure: boolean;
    source: string;
    blockNumber: number;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Secure Random</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-600 px-2 py-0.5 rounded">
          {output.source}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
        {output.randomNumber}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        Range: 0 - {output.range} | Block #{output.blockNumber}
      </div>
    </div>
  );
}

function VerificationCard({ toolCall }: { toolCall: ToolCall }) {
  const output = toolCall.output as {
    success?: boolean;
    submission?: { status: string; tx_hash: string; roundId: number; message: string };
    proof?: { status: string; roundId: number; source: string; proof_data?: Record<string, unknown> };
    // get_fdc_proof shape
    status?: string;
    roundId?: number;
    source?: string;
  };

  const status = output.proof?.status ?? output.status ?? "unknown";
  const roundId = output.proof?.roundId ?? output.roundId ?? 0;
  const source = output.proof?.source ?? output.source ?? "";
  const txHash = output.submission?.tx_hash ?? "";
  const isVerified = status === "verified";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {txHash ? "Transaction Verification" : "Attestation Proof"}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            isVerified
              ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
              : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400"
          }`}
        >
          {status}
        </span>
      </div>
      {txHash && (
        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          Tx: {txHash.length > 14 ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : txHash}
        </div>
      )}
      <div className="space-y-1 text-xs text-gray-400 dark:text-gray-500">
        <div>
          <span className="text-gray-400 dark:text-gray-600">Round:</span> {roundId}
        </div>
        <div>
          <span className="text-gray-400 dark:text-gray-600">Source:</span> {source}
        </div>
      </div>
    </div>
  );
}

function AssetsCard({ toolCall }: { toolCall: ToolCall }) {
  const output = toolCall.output as {
    supported_symbols?: string[];
    note?: string;
  };
  const symbols = output.supported_symbols ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Supported Assets</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-600 px-2 py-0.5 rounded">
          FTSO v2
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {symbols.map((s) => (
          <span
            key={s}
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-600 text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {s}/USD
          </span>
        ))}
      </div>
      {output.note && (
        <div className="text-xs text-gray-400 dark:text-gray-500">{output.note}</div>
      )}
    </div>
  );
}

function GenericCard({ toolCall }: { toolCall: ToolCall }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-500 dark:text-gray-400">{toolCall.name}</div>
      <pre className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-dark-900/50 rounded p-2 overflow-x-auto">
        {JSON.stringify(toolCall.output ?? toolCall.input, null, 2)}
      </pre>
    </div>
  );
}

const toolIcons: Record<string, string> = {
  get_price: "\u{1F4C8}",
  get_random: "\u{1F3B2}",
  verify_on_flare: "\u{1F50D}",
  get_fdc_proof: "\u{1F50F}",
  list_supported_assets: "\u{1F4CB}",
};

const toolLabels: Record<string, string> = {
  get_price: "Price Feed",
  get_random: "Random Number",
  verify_on_flare: "FDC Verification",
  get_fdc_proof: "FDC Proof",
  list_supported_assets: "Supported Assets",
};

export default function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const isPending = toolCall.status === "pending";
  const isError = toolCall.status === "error";
  const icon = toolIcons[toolCall.name] ?? "\u{1F527}";
  const label = toolLabels[toolCall.name] ?? toolCall.name;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border
        ${isPending ? "border-flare-coral/30 bg-gray-50/80 dark:bg-dark-700/80" : ""}
        ${isError ? "border-red-500/30 bg-gray-50/80 dark:bg-dark-700/80" : ""}
        ${!isPending && !isError ? "border-gray-200 dark:border-dark-500 bg-gray-50/60 dark:bg-dark-700/60" : ""}
        backdrop-blur-sm p-4 animate-fade-in
      `}
    >
      {isPending && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-flare-coral/5 to-transparent animate-pulse-slow" />
      )}

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
          {isPending && (
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-1.5 h-1.5 bg-flare-coral rounded-full animate-pulse" />
              <span className="text-xs text-flare-coral">Calling...</span>
            </div>
          )}
          {isError && (
            <span className="ml-auto text-xs text-red-400">Error</span>
          )}
        </div>

        {isPending ? (
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-dark-500 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-dark-500 rounded animate-pulse w-1/2" />
          </div>
        ) : toolCall.name === "get_price" ? (
          <PriceCard toolCall={toolCall} />
        ) : toolCall.name === "get_random" ? (
          <RandomCard toolCall={toolCall} />
        ) : toolCall.name === "verify_on_flare" || toolCall.name === "get_fdc_proof" ? (
          <VerificationCard toolCall={toolCall} />
        ) : toolCall.name === "list_supported_assets" ? (
          <AssetsCard toolCall={toolCall} />
        ) : (
          <GenericCard toolCall={toolCall} />
        )}
      </div>
    </div>
  );
}
