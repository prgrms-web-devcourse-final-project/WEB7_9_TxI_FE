import { type ReactNode, useState, useEffect, Suspense } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "sonner";
import { LoginModal } from "@/components/LoginModal";
import { SignupModal } from "@/components/SignupModal";
import { PageLoadingFallback } from "@/components/LoadingFallback";
import { PageErrorFallback } from "@/components/ErrorFallback";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState<
    string | undefined
  >();
  const router = useRouterState();

  // 로그인 모달 열기 이벤트 리스닝
  useEffect(() => {
    const handleOpenLoginModal = (
      event: CustomEvent<{ redirectPath?: string }>,
    ) => {
      setLoginRedirectPath(
        event.detail?.redirectPath || router.location.pathname,
      );
      setIsLoginModalOpen(true);
    };

    window.addEventListener(
      "openLoginModal",
      handleOpenLoginModal as EventListener,
    );
    return () => {
      window.removeEventListener(
        "openLoginModal",
        handleOpenLoginModal as EventListener,
      );
    };
  }, [router.location.pathname]);

  // 회원가입 모달 열기 이벤트 리스닝
  useEffect(() => {
    const handleOpenSignupModal = () => {
      setIsSignupModalOpen(true);
    };

    window.addEventListener("openSignupModal", handleOpenSignupModal);
    return () => {
      window.removeEventListener("openSignupModal", handleOpenSignupModal);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onLoginClick={() => setIsLoginModalOpen(true)}
        onSignupClick={() => setIsSignupModalOpen(true)}
      />
      <main className="flex-1">
        <ErrorBoundary FallbackComponent={PageErrorFallback}>
          <Suspense fallback={<PageLoadingFallback />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        redirectPath={loginRedirectPath}
      />
      <SignupModal
        open={isSignupModalOpen}
        onOpenChange={setIsSignupModalOpen}
        onSignupSuccess={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}
