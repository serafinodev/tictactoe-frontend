// app/game/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import confetti from "canvas-confetti";

export default function GamePage() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({
    player1Wins: 0,
    player2Wins: 0,
    draws: 0,
  });
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<"X" | "O" | "Draw" | null>(null);

  const handleStartGame = () => {
    if (player1 && player2) {
      setGameStarted(true);
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] || checkWinner(board)) return;
    const updatedBoard = [...board];
    updatedBoard[index] = currentPlayer;
    setBoard(updatedBoard);

    const result = checkWinner(updatedBoard);
    if (result) {
      setWinner(result);
      setShowDialog(true);
      if (result !== "Draw") {
        handleConfetti();
      }
      if (result === "X")
        setScores((s) => ({ ...s, player1Wins: s.player1Wins + 1 }));
      else if (result === "O")
        setScores((s) => ({ ...s, player2Wins: s.player2Wins + 1 }));
      else setScores((s) => ({ ...s, draws: s.draws + 1 }));
    } else if (!updatedBoard.includes(null)) {
      setWinner("Draw");
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
      setShowDialog(true);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const checkWinner = (b: ("X" | "O" | null)[]): "X" | "O" | "Draw" | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b_, c] of lines) {
      if (b[a] && b[a] === b[b_] && b[a] === b[c]) return b[a];
    }
    if (!b.includes(null)) return "Draw";
    return null;
  };

  const handleContinue = () => {
    setRound((prev) => prev + 1);
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
  };

  const handleStop = () => {
    // Here you can call your backend API to save game session
    // Then redirect to home ("/")
    window.location.href = "/";
  };

  const handleConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {gameStarted ? `Round ${round}` : "Enter Player Names"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!gameStarted ? (
            <>
              <Input
                placeholder="Player 1 Name"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
              />
              <Input
                placeholder="Player 2 Name"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
              />
              <Button
                variant="secondary"
                onClick={handleStartGame}
                className="w-full text-lg py-4 rounded-xl"
              >
                Start
              </Button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="font-semibold">
                  {player1}: {scores.player1Wins}
                </div>
                <div className="font-semibold">Draws: {scores.draws}</div>
                <div className="font-semibold">
                  {player2}: {scores.player2Wins}
                </div>
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-2">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      className="w-20 h-20 text-2xl font-bold flex items-center justify-center border border-white rounded-md hover:bg-gray-800"
                      onClick={() => handleCellClick(index)}
                    >
                      <span
                        className={
                          cell === "X"
                            ? "text-blue-500"
                            : cell === "O"
                            ? "text-pink-500"
                            : ""
                        }
                      >
                        {cell}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent
                  className="text-center flex flex-col items-center justify-center gap-6 w-[350px]"
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {winner === "Draw"
                        ? "It's a draw!"
                        : `${winner === "X" ? player1 : player2} wins!`}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex justify-center gap-4 mt-4 w-full">
                    <Button
                      onClick={() => {
                        handleContinue();
                        setShowDialog(false);
                      }}
                      className="w-32"
                    >
                      Continue
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleStop}
                      className="w-32"
                    >
                      Stop
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
