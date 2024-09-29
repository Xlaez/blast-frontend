"use client"
import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-gray-900 min-h-screen p-8">
      <main className="w-full max-w-lg text-center">
        <WalletConnect />
      </main>
    </div>
  );
}
