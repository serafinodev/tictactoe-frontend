import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
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
            <CardTitle className="text-lg">Previous Games</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-200">
            {/* Replace with dynamic content later */}
            <div className="bg-white/5 p-3 rounded-md">
              Player1 vs Player2 — W:2 L:1 D:1
            </div>
            <Separator className="bg-white/10" />
            <div className="bg-white/5 p-3 rounded-md">
              Alice vs Bob — W:1 L:3 D:0
            </div>
            <Separator className="bg-white/10" />
            <div className="bg-white/5 p-3 rounded-md">
              Test vs Dummy — W:0 L:0 D:1
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-12 text-sm text-gray-500 text-center">
        &copy; 2025 Tic Tac Toe by serafinodev
      </footer>
    </main>
  );
}
