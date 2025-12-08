import { type ReactNode, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "sonner";
import { LoginModal } from "@/components/LoginModal";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={() => setIsLoginModalOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="top-right" richColors />
      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </div>
  );
}
