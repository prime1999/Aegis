import Image from "next/image";

import { BottomNav } from "@/components/layouts/bottom-nav";
import { Navbar } from "@/components/layouts/navbar";
import { Sidebar } from "@/components/layouts/sidebar";

const Page = () => {
  return (
    <div className="min-h-dvh bg-bg-base text-text-primary">
      <Navbar />
      <main className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl gap-6 px-4 pb-28 pt-8 sm:px-6 lg:grid-cols-3 lg:items-center lg:px-8">
        <div className="lg:col-start-1">
          <Sidebar className="lg:sticky lg:top-24" />
        </div>
        <div className="flex min-h-72 items-center justify-center lg:col-start-2">
          <Image
            src="/images/generalAI.png"
            alt="Aegis general AI visual"
            width={300}
            height={300}
            priority
            className="h-auto w-full max-w-76 object-contain sm:max-w-88 lg:max-w-104"
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Page;
