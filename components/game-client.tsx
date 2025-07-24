"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";

import confetti from "canvas-confetti";

export default function GameClient() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const vsAI = mode === "ai";
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerSymbols, setPlayerSymbols] = useState<{
    [key: string]: "X" | "O";
  }>({});
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleStartGame = async () => {
    if (player1 && (vsAI || player2)) {
      const aiName = vsAI ? "AI Bot" : player2;
      try {
        // const res = await fetch(
        //   `${process.env.NEXT_PUBLIC_API_URL}/api/games`,
        //   {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ player1, player2: aiName }),
        //   }
        // );

        // if (!res.ok) throw new Error("Failed to create game");

        // const data = await res.json();
        // setGameId(data._id);
        setGameStarted(true);

        const isPlayer1X = round % 2 === 1;
        setPlayerSymbols({
          [player1]: isPlayer1X ? "X" : "O",
          [aiName]: isPlayer1X ? "O" : "X",
        });

        setPlayer2(aiName); // ✅ Track it in state
        setCurrentPlayer("X");
      } catch (err) {
        console.error("Error starting game:", err);
      }
    }
  };

  useEffect(() => {
    if (
      vsAI &&
      currentPlayer === playerSymbols[player2] &&
      !checkWinner(board)
    ) {
      const timeout = setTimeout(() => {
        makeAIMove(board);
      }, 500);

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, board, vsAI, playerSymbols, player2]);

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

      // ✅ Determine who the winner is based on the playerSymbols mapping
      if (result === "Draw") {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        const winnerName = Object.keys(playerSymbols).find(
          (player) => playerSymbols[player] === result
        );
        if (winnerName === player1) {
          setScores((s) => ({ ...s, player1Wins: s.player1Wins + 1 }));
        } else if (winnerName === player2) {
          setScores((s) => ({ ...s, player2Wins: s.player2Wins + 1 }));
        }
      }
    } else if (!updatedBoard.includes(null)) {
      setWinner("Draw");
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
      setShowDialog(true);
    } else {
      const nextPlayer = currentPlayer === "X" ? "O" : "X";
      setCurrentPlayer(nextPlayer);

      const aiSymbol = playerSymbols[player2]; // 'O' or 'X'
      if (vsAI && nextPlayer === aiSymbol) {
        return setTimeout(() => makeAIMove(updatedBoard), 500);
      }
    }
  };

  const makeAIMove = (currentBoard: ("X" | "O" | null)[]) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v) => v !== null) as number[];

    if (emptyIndices.length === 0) return;

    const randomIndex =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const updatedBoard = [...currentBoard];
    updatedBoard[randomIndex] = playerSymbols[player2]; // AI plays

    const result = checkWinner(updatedBoard);
    setBoard(updatedBoard); // ✅ always update after decision is made

    if (result) {
      setWinner(result);
      setShowDialog(true);
      if (result !== "Draw") handleConfetti();

      const winnerName =
        result === "Draw"
          ? "Draw"
          : Object.keys(playerSymbols).find(
              (player) => playerSymbols[player] === result
            );

      if (result === "Draw") {
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else if (winnerName === player1) {
        setScores((s) => ({ ...s, player1Wins: s.player1Wins + 1 }));
      } else if (winnerName === player2) {
        setScores((s) => ({ ...s, player2Wins: s.player2Wins + 1 }));
      }
    } else {
      // Switch back to human
      setCurrentPlayer(playerSymbols[player1]);
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

  const saveRound = async (winner: string) => {
    let newGameId = gameId;

    if (!gameId) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/games`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              player1,
              player2,
              player1Symbol: playerSymbols[player1],
              player2Symbol: playerSymbols[player2],
              mode,
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to create game");

        const data = await res.json();
        newGameId = data._id;
        setGameId(newGameId);
      } catch (err) {
        console.error("Failed to create game:", err);
        return;
      }
    }

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/games/${newGameId}/round`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ winner }),
        }
      );
    } catch (err) {
      console.error("Failed to save round:", err);
    }
  };

  const handleContinue = async () => {
    if (winner) {
      const winnerName =
        winner === "Draw"
          ? "Draw"
          : Object.keys(playerSymbols).find(
              (player) => playerSymbols[player] === winner
            ) || "Draw";

      await saveRound(winnerName);
    }

    setRound((prev) => prev + 1);
    const isPlayer1X = (round + 1) % 2 === 1;
    setPlayerSymbols({
      [player1]: isPlayer1X ? "X" : "O",
      [player2]: isPlayer1X ? "O" : "X",
    });
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
  };

  const handleStop = async () => {
    if (winner) {
      const winnerName =
        winner === "Draw"
          ? "Draw"
          : Object.keys(playerSymbols).find(
              (player) => playerSymbols[player] === winner
            ) || "Draw";

      await saveRound(winnerName);
    }

    window.location.href = "/";
  };

  const handleMainMenu = async () => {
    if (winner) {
      const winnerName =
        winner === "Draw"
          ? "Draw"
          : Object.keys(playerSymbols).find(
              (player) => playerSymbols[player] === winner
            ) || "Draw";

      await saveRound(winnerName); // same helper we made earlier
    }

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
    <div>
      <div className="mb-8 text-center">
        <Button variant="secondary" onClick={() => setShowConfirmDialog(true)}>
          Main Menu
        </Button>
      </div>
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
              {!vsAI && (
                <Input
                  placeholder="Player 2 Name"
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                />
              )}
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
                <div className="font-semibold text-xs sm:text-sm md:text-base break-words">
                  {player1} (
                  <span className="text-blue-400 font-semibold">
                    {" "}
                    {playerSymbols[player1]}{" "}
                  </span>
                  ): {scores.player1Wins}
                </div>
                <div className="font-semibold text-xs sm:text-sm md:text-base break-words">
                  Draws: {scores.draws}
                </div>
                <div className="font-semibold text-xs sm:text-sm md:text-base break-words">
                  {player2} (
                  <span className="text-pink-400 font-semibold">
                    {" "}
                    {playerSymbols[player2]}{" "}
                  </span>
                  ): {scores.player2Wins}
                </div>
              </div>
              <div className="text-center text-md text-white font-medium mt-1">
                {currentPlayer === playerSymbols[player1]
                  ? `${player1}'s Turn`
                  : `${player2}'s Turn`}
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
                          cell === playerSymbols[player1]
                            ? "text-blue-500"
                            : cell === playerSymbols[player2]
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
                        : `${Object.keys(playerSymbols).find(
                            (player) => playerSymbols[player] === winner
                          )} wins!`}
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
              {winner && (
                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDialog(true)}
                  >
                    Show Results
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="text-center w-[350px]">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Are you sure you want to return to the main menu?
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-32"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowConfirmDialog(false);
                handleMainMenu(); // call your function here
              }}
              className="w-32"
            >
              Yes, Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
