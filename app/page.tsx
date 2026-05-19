import Image from "next/image";

import { BottomNav } from "@/components/layouts/bottom-nav";
import { Navbar } from "@/components/layouts/navbar";

const Page = () => {
  return (
    <div className="min-h-dvh bg-bg-base text-text-primary">
      <Navbar />

      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl items-center justify-center px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-6xl overflow-hidden flex items-center justify-center">
          <Image
            src="/images/generalAI.png"
            alt="Aegis general AI visual"
            width={300}
            height={300}
            priority
            className="h-auto w-auto object-cover"
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Page;
