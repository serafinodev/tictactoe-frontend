"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Round {
  winner: string | "Draw";
}

interface Game {
  _id: string;
  player1: string;
  player2: string;
  rounds: Round[];
  createdAt: string;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games`);
        const data = await res.json();
        setGames(data);
      } catch (error) {
        console.error("Failed to fetch games", error);
      }
    };

    fetchGames();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Tic Tac Toe</h1>
        <p className="text-lg md:text-xl text-gray-300">
          Challenge your friend and track your wins, losses, and draws!
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <Link href="/game">
          <Button
            variant="secondary"
            className="w-full text-lg py-6 rounded-xl"
          >
            Start New Game
          </Button>
        </Link>

        <Card className="bg-white/5 border-white/10 text-white mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Previous Games</CardTitle>
              {games.length > 3 && (
                <div>
                  <Link href="/history">
                    <Button
                      variant="link"
                      className="w-full text-muted-foreground"
                    >
                      View All Matches
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-200">
            {games.length === 0 && (
              <p className="text-gray-400">No games yet.</p>
            )}
            {games
              .slice(0, 3)
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((game) => {
                const p1Wins = game.rounds.filter(
                  (r) => r.winner === game.player1
                ).length;
                const p2Wins = game.rounds.filter(
                  (r) => r.winner === game.player2
                ).length;
                const draws = game.rounds.filter(
                  (r) => r.winner === "Draw"
                ).length;

                // Highlight winner
                const highlightClass = (wins1: number, wins2: number) =>
                  wins1 > wins2
                    ? "text-green-400 font-bold"
                    : wins1 < wins2
                    ? "text-red-400 font-bold"
                    : "text-yellow-400 font-bold";

                return (
                  <div
                    key={game._id}
                    className="bg-white/10 rounded-lg p-4 shadow-md"
                  >
                    <div className="flex justify-between items-center mb-2 text-xs sm:text-sm">
                      <div className="text-gray-400">
                        {new Date(game.createdAt).toLocaleString()}
                      </div>
                      <div className="px-2 py-1 rounded bg-white/10 text-gray-300">
                        Total Rounds: {game.rounds.length}
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 mb-2 text-sm sm:text-base flex-wrap">
                      <div
                        className={`${highlightClass(
                          p1Wins,
                          p2Wins
                        )} truncate max-w-[40%]`}
                      >
                        {game.player1}: {p1Wins} {p1Wins === 1 ? "win" : "wins"}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm">vs</div>
                      <div
                        className={`${highlightClass(
                          p2Wins,
                          p1Wins
                        )} truncate max-w-[40%] text-right`}
                      >
                        {game.player2}: {p2Wins} {p2Wins === 1 ? "win" : "wins"}
                      </div>
                    </div>

                    <div className="text-center text-gray-300 text-sm sm:text-base">
                      Draws:{" "}
                      <span className="text-blue-400 font-semibold">
                        {draws}
                      </span>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      <footer className="mt-12 text-sm text-gray-500 text-center">
        &copy; 2025 Tic Tac Toe by serafinodev
      </footer>
    </main>
  );
}
