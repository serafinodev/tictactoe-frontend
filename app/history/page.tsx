"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Round {
  winner: "Player 1" | "Player 2" | "Draw";
}

interface Game {
  _id: string;
  player1: string;
  player2: string;
  rounds: Round[];
  createdAt: string;
}

const GAMES_PER_PAGE = 5;

export default function AllGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games`);
        const data = await res.json();
        setGames(data.sort((a: Game, b: Game) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error("Failed to fetch games", error);
      }
    };

    fetchGames();
  }, []);

  const totalPages = Math.ceil(games.length / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const currentGames = games.slice(startIndex, startIndex + GAMES_PER_PAGE);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const highlightClass = (wins1: number, wins2: number) =>
    wins1 > wins2
      ? "text-green-400 font-bold"
      : wins1 < wins2
      ? "text-red-400 font-bold"
      : "text-yellow-400 font-bold";

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">All Matches</h1>
        <p className="text-lg text-gray-300">A history of all Tic Tac Toe battles!</p>
      </div>

      <div className="w-full max-w-2xl">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Game History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-200">
            {currentGames.length === 0 && (
              <p className="text-gray-400">No games recorded yet.</p>
            )}

            {currentGames.map((game) => {
              const p1Wins = game.rounds.filter((r) => r.winner === game.player1).length;
              const p2Wins = game.rounds.filter((r) => r.winner === game.player2).length;
              const draws = game.rounds.filter((r) => r.winner === "Draw").length;

              return (
                <div key={game._id} className="bg-white/10 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-400">
                      {new Date(game.createdAt).toLocaleString()}
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">
                      Rounds: {game.rounds.length}
                    </div>
                  </div>

                  <div className="flex justify-between text-lg mb-2">
                    <div className={`${highlightClass(p1Wins, p2Wins)}`}>
                      {game.player1}: {p1Wins} {p1Wins === 1 ? "win" : "wins"}
                    </div>
                    <div className="text-gray-400 text-sm">vs</div>
                    <div className={`${highlightClass(p2Wins, p1Wins)}`}>
                      {game.player2}: {p2Wins} {p2Wins === 1 ? "win" : "wins"}
                    </div>
                  </div>

                  <div className="text-center text-gray-300">
                    Draws:{" "}
                    <span className="text-blue-400 font-semibold">{draws}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {games.length > GAMES_PER_PAGE && (
          <div className="flex justify-center items-center mt-6 px-2 gap-4">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="disabled:opacity-50"
            >
              <ChevronLeft /> Prev
            </Button>
            <div className="text-gray-300 text-sm">
              Page {currentPage} of {totalPages}
            </div>
            
            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="disabled:opacity-50"
            >
              <ChevronRight /> Next
            </Button>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <Link href="/">
            <Button variant="secondary">
                <ChevronLeft /> Back to Home</Button>
          </Link>
        </div>
      </div>

      <footer className="mt-12 text-sm text-gray-500 text-center">
        &copy; 2025 Tic Tac Toe by serafinodev
      </footer>
    </main>
  );
}
