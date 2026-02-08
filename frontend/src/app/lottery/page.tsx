"use client";

import { useState } from "react";

interface Player {
  name: string;
  number: number | null;
  locked: boolean;
  isRolling: boolean;
}

const INITIAL_PLAYERS: Player[] = [
  { name: "Player 1", number: null, locked: false, isRolling: false },
  { name: "Player 2", number: null, locked: false, isRolling: false },
  { name: "Player 3", number: null, locked: false, isRolling: false },
];

async function fetchRoll(): Promise<number> {
  const res = await fetch("/api/lottery");
  const data = await res.json();
  return data.number;
}

function formatDigits(num: number): string[] {
  return String(num).padStart(5, "0").split("");
}

export default function LotteryPage() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [flareNumber, setFlareNumber] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawDone, setDrawDone] = useState(false);

  const updatePlayer = (index: number, update: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...update } : p))
    );
  };

  const handleRoll = async (index: number) => {
    updatePlayer(index, { isRolling: true });
    try {
      const num = await fetchRoll();
      updatePlayer(index, { number: num, isRolling: false });
    } catch {
      updatePlayer(index, { isRolling: false });
    }
  };

  const handleLock = (index: number) => {
    updatePlayer(index, { locked: true });
  };

  const handleDraw = async () => {
    setIsDrawing(true);
    try {
      const num = await fetchRoll();
      setFlareNumber(num);
      setDrawDone(true);
    } catch {
      // ignore
    }
    setIsDrawing(false);
  };

  const handleReset = () => {
    setPlayers(INITIAL_PLAYERS);
    setFlareNumber(null);
    setIsDrawing(false);
    setDrawDone(false);
  };

  const isWinner = (player: Player): boolean => {
    return (
      drawDone &&
      player.locked &&
      player.number !== null &&
      flareNumber !== null &&
      player.number === flareNumber
    );
  };

  const allLocked = players.every((p) => p.locked);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Flare Lottery
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          Roll your 5-digit number using Flare&apos;s on-chain random oracle.
          Match the Flare Central draw to win free FLR!
        </p>
      </div>

      {/* Cards grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Player cards */}
        {players.map((player, i) => {
          const won = isWinner(player);
          const lost = drawDone && player.locked && !won;

          return (
            <div
              key={i}
              className={`
                relative rounded-xl border p-6 flex flex-col items-center gap-4 transition-all duration-300
                ${
                  won
                    ? "border-green-400 bg-green-50 dark:bg-green-950/30 shadow-lg shadow-green-500/20 scale-105"
                    : lost
                      ? "border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-800 opacity-60"
                      : "border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-800"
                }
              `}
            >
              {/* Winner badge */}
              {won && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  WINNER!
                </div>
              )}

              {/* Editable name */}
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayer(i, { name: e.target.value })}
                disabled={player.locked}
                className="w-full text-center text-sm font-semibold bg-transparent border-b border-transparent focus:border-flare-coral outline-none text-gray-900 dark:text-white disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors"
              />

              {/* Number display */}
              <div className="flex gap-1.5">
                {(player.number !== null
                  ? formatDigits(player.number)
                  : ["_", "_", "_", "_", "_"]
                ).map((digit, d) => (
                  <div
                    key={d}
                    className={`
                      w-10 h-12 flex items-center justify-center rounded-lg text-xl font-mono font-bold
                      ${
                        player.number !== null
                          ? "bg-gray-100 dark:bg-dark-600 text-gray-900 dark:text-white"
                          : "bg-gray-50 dark:bg-dark-700 text-gray-300 dark:text-dark-400"
                      }
                      ${player.isRolling ? "animate-pulse" : ""}
                    `}
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 w-full">
                {!player.locked ? (
                  <>
                    <button
                      onClick={() => handleRoll(i)}
                      disabled={player.isRolling || drawDone}
                      className="flex-1 py-2 rounded-lg text-sm font-medium bg-flare-coral hover:bg-flare-coral-dark text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {player.isRolling ? "Rolling..." : "Roll"}
                    </button>
                    {player.number !== null && (
                      <button
                        onClick={() => handleLock(i)}
                        disabled={drawDone}
                        className="flex-1 py-2 rounded-lg text-sm font-medium border border-flare-coral text-flare-coral hover:bg-flare-coral hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Lock In
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30">
                    Locked
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Flare Central card */}
        <div
          className={`
            relative rounded-xl border p-6 flex flex-col items-center gap-4 transition-all
            border-flare-coral/30 bg-gradient-to-b from-flare-coral/5 to-flare-coral/10 dark:from-flare-coral/10 dark:to-flare-coral/5
          `}
        >
          <div className="text-sm font-bold text-flare-coral tracking-wider uppercase">
            Flare Central
          </div>

          {/* Number display */}
          <div className="flex gap-1.5">
            {(flareNumber !== null
              ? formatDigits(flareNumber)
              : ["_", "_", "_", "_", "_"]
            ).map((digit, d) => (
              <div
                key={d}
                className={`
                  w-10 h-12 flex items-center justify-center rounded-lg text-xl font-mono font-bold
                  ${
                    flareNumber !== null
                      ? "bg-flare-coral/10 dark:bg-flare-coral/20 text-flare-coral"
                      : "bg-gray-50 dark:bg-dark-700 text-gray-300 dark:text-dark-400"
                  }
                  ${isDrawing ? "animate-pulse" : ""}
                `}
              >
                {digit}
              </div>
            ))}
          </div>

          {/* Draw / Reset button */}
          {!drawDone ? (
            <button
              onClick={handleDraw}
              disabled={isDrawing || !allLocked}
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-flare-coral to-flare-coral-dark text-white shadow-lg shadow-flare-coral/20 hover:shadow-flare-coral/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              {isDrawing
                ? "Drawing..."
                : !allLocked
                  ? "All players must lock in"
                  : "DRAW"}
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-lg text-sm font-bold border border-flare-coral text-flare-coral hover:bg-flare-coral hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Result banner */}
      {drawDone && (
        <div className="max-w-5xl mx-auto mt-8 text-center animate-fade-in">
          {players.some(isWinner) ? (
            <div className="text-2xl font-bold text-green-500">
              We have a winner!{" "}
              {players
                .filter(isWinner)
                .map((p) => p.name)
                .join(", ")}{" "}
              matched the Flare Central number!
            </div>
          ) : (
            <div className="text-xl text-gray-500 dark:text-gray-400">
              No match this round. Try again!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
