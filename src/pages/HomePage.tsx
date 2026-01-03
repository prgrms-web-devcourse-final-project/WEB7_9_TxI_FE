import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Shield, Users, Clock, TrendingUp, Lock, Ticket, ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [whyAnimated, setWhyAnimated] = useState(false);
  const [howAnimated, setHowAnimated] = useState(false);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);
  
  const whySectionRef = useRef<HTMLElement>(null);
  const howSectionRef = useRef<HTMLElement>(null);
  const firstButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const updateButtonWidth = () => {
      if (firstButtonRef.current && window.innerWidth < 640) {
        const width = firstButtonRef.current.offsetWidth;
        setButtonWidth(width);
      } else {
        setButtonWidth(null);
      }
    };

    updateButtonWidth();
    window.addEventListener('resize', updateButtonWidth);
    
    return () => {
      window.removeEventListener('resize', updateButtonWidth);
    };
  }, []);

  const scrollToWhyWaitFair = () => {
    if (whySectionRef.current) {
      whySectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToHowItWorks = () => {
    if (howSectionRef.current) {
      howSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -150px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === whySectionRef.current) {
            setWhyAnimated(true);
          } else if (entry.target === howSectionRef.current) {
            setHowAnimated(true);
          }
        } else {
          if (entry.target === whySectionRef.current) {
            setWhyAnimated(false);
          } else if (entry.target === howSectionRef.current) {
            setHowAnimated(false);
          }
        }
      });
    }, observerOptions);

    const timer = setTimeout(() => {
      if (whySectionRef.current) {
        observer.observe(whySectionRef.current);
      }
      if (howSectionRef.current) {
        observer.observe(howSectionRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ animationDelay: '4s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              공정한 티켓팅,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                모두에게 평등한 기회
              </span>
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold mb-10 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                WaitFair
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              사전 등록과 랜덤 대기열로 속도 경쟁을 없애고, 강화된 보안으로 암표와 위조를 <br/> 원천 차단합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div ref={firstButtonRef} className="w-fit">
                <Link to="/events">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-base group border-2 border-gray-300 hover:border-blue-600 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      이벤트 둘러보기
                    </span>
                  </Button>
                </Link>
              </div>
              <Button 
                size="lg" 
                variant="outline"
                onClick={scrollToWhyWaitFair}
                className="w-fit sm:w-auto text-base group border-2 border-gray-300 hover:border-blue-600 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                style={buttonWidth ? { width: `${buttonWidth}px` } : undefined}
              >
                <span className="flex items-center gap-2 justify-center">
                  <Sparkles className="w-4 h-4" />
                  <span className="truncate">왜 WaitFair인가?</span>
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={scrollToHowItWorks}
                className="w-fit sm:w-auto text-base group border-2 border-gray-300 hover:border-blue-600 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                style={buttonWidth ? { width: `${buttonWidth}px` } : undefined}
              >
                <span className="flex items-center gap-2 justify-center">
                  <PlayCircle className="w-4 h-4" />
                  <span className="truncate">이렇게 작동합니다</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

    
      <section 
        ref={whySectionRef}
        className={`min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white transition-all duration-1000 ease-out ${
          whyAnimated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-70 translate-y-8 scale-[0.97]'
        }`}
      >
        <div className="container mx-auto px-4 w-full py-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              왜 WaitFair인가?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              공정하고 투명하며 안전한 예매 경험을 제공합니다
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 lg:grid-cols-2 gap-8">
              {[
                { icon: Users, color: "blue", title: "공정한 티켓팅", description: "사전 등록과 랜덤 대기열로 네트워크 속도나 기기 성능과 관계없이 모두에게 동등한 기회를 제공합니다." },
                { icon: Shield, color: "purple", title: "암표 원천 차단", description: "Dynamic QR과 소유권 체인으로 외부 거래와 위조를 완벽하게 방지합니다." },
                { icon: Lock, color: "blue", title: "봇·매크로 차단", description: "reCAPTCHA과 디바이스 핑거프린팅으로 비정상적인 접근을 실시간 차단합니다." },
                { icon: Clock, color: "purple", title: "실시간 대기열", description: "WebSocket 기반 실시간 알림으로 내 순번과 예상 대기 시간을 즉시 확인할 수 있습니다." },
                { icon: TrendingUp, color: "blue", title: "투명한 거래", description: "플랫폼 내 재판매 관리와 거래 이력 추적으로 모든 거래를 투명하게 검증합니다." },
                { icon: Ticket, color: "purple", title: "범용 대기열 인프라", description: "콘서트, 팝업스토어, 한정판 드롭 등 다양한 산업에 확장 가능한 시스템입니다." },
              ].map((feature, index) => {
                const Icon = feature.icon;
                const isBlue = feature.color === "blue";
                return (
                  <Card 
                    key={index}
                    className="group p-6 border-2 border-gray-200 hover:border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${isBlue ? 'from-blue-50 to-blue-100' : 'from-purple-50 to-purple-100'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <div className="relative z-10">
                      <div className={`w-14 h-14 ${isBlue ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-purple-50 group-hover:bg-purple-100'} rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className={`w-7 h-7 ${isBlue ? 'text-blue-600' : 'text-purple-600'} transition-transform group-hover:scale-110`} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-gray-900 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-base md:text-lg text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={howSectionRef}
        className={`min-h-screen flex items-center bg-white transition-all duration-1000 ease-out ${
          howAnimated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.95]'
        }`}
      >
        <div className="container mx-auto px-4 w-full py-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              이렇게 작동합니다
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              간단한 6단계로 공정한 티켓팅을 경험하세요
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 relative">
              <div className="hidden md:block absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-blue-200 via-purple-200 to-purple-200 transform -translate-x-1/2" />
              
              <div className="space-y-12">
                {[
                  { step: 1, color: "blue", title: "사전 등록", description: "본인 인증 후 원하는 이벤트에 사전 등록하세요. 접속 속도나 기기 성능에 따른 경쟁은 없습니다." },
                  { step: 2, color: "blue", title: "랜덤 대기열 배정", description: "사전 등록 마감 후, 티켓팅 시작 1시간 전에 공정한 방식으로 대기순번이 무작위로 배정됩니다." },
                  { step: 3, color: "blue", title: "순번 기반 입장", description: "실시간 알림으로 내 차례를 확인하고 자동으로 예매 페이지에 입장합니다." },
                ].map((item) => {
                  const isBlue = item.color === "blue";
                  return (
                    <div 
                      key={item.step}
                      className="flex gap-6 group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 ${isBlue ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-125 group-hover:shadow-2xl transition-all duration-300`}>
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 break-keep group-hover:text-blue-600 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed break-keep break-words group-hover:text-gray-700 transition-colors duration-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-12">
                {[
                  { step: 4, color: "purple", title: "실시간 좌석 확인", description: "실시간으로 업데이트되는 좌석 현황을 확인하며 원하는 좌석을 선택해 티켓을 예매하세요." },
                  { step: 5, color: "purple", title: "간편하고 빠른 결제", description: "Toss Payments 기반의 간편 결제로 복잡한 절차 없이 안전하게 결제를 완료합니다." },
                  { step: 6, color: "purple", title: "안전한 입장", description: "Dynamic QR로 위조 불가능한 티켓을 받고 안전하게 이벤트에 입장하세요." },
                ].map((item) => {
                  const isBlue = item.color === "blue";
                  return (
                    <div 
                      key={item.step}
                      className="flex gap-6 group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] md:flex-row-reverse"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 ${isBlue ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-125 group-hover:shadow-2xl transition-all duration-300`}>
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 md:text-right">
                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 break-keep group-hover:text-blue-600 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed break-keep break-words group-hover:text-gray-700 transition-colors duration-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            지금 바로 공정한 티켓팅을 경험하세요
          </h2>
          <p className="text-lg text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            암표 걱정 없이, 봇 경쟁 없이, 모두에게 평등한 기회를 제공하는 WaitFair
          </p>
          <Link to="/events">
            <Button 
              size="lg" 
              variant="outline"
              className="text-base !bg-white !text-blue-600 !border-white hover:!bg-gray-50 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl font-semibold group"
            >
              <span className="flex items-center gap-2">
                이벤트 둘러보기
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}