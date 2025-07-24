import GameClient from "@/components/game-client";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-8">
      <GameClient />
      <footer className="mt-12 text-sm text-gray-500 text-center">
        &copy; 2025 Tic Tac Toe by serafinodev
      </footer>
    </main>
  );
}
