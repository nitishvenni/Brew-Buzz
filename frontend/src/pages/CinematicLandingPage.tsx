import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

type StoryBeat = {
  id: number;
  start: number;
  end: number;
  main1: string;
  main2?: string;
  support?: string;
  variant: 'fadeUp' | 'mask' | 'stagger' | 'signal' | 'confident' | 'titleCard' | 'fadeOnly';
};

const STORY_BEATS: StoryBeat[] = [
  {
    id: 1,
    start: 0.2,
    end: 2.5,
    main1: "EVERY GREAT EXPERIENCE",
    main2: "STARTS WITH THE CRAFT.",
    support: "It begins with the details.",
    variant: 'fadeUp'
  },
  {
    id: 2,
    start: 2.8,
    end: 5.0,
    main1: "EVERY DETAIL",
    main2: "HAS A PURPOSE.",
    support: "CONSISTENCY IS BUILT, NOT ASSUMED.",
    variant: 'mask'
  },
  {
    id: 3,
    start: 5.3,
    end: 7.5,
    main1: "EVERY CHOICE",
    main2: "SHAPES WHAT COMES NEXT.",
    support: "INGREDIENTS. PEOPLE. PROCESS.",
    variant: 'stagger'
  },
  {
    id: 4,
    start: 7.8,
    end: 10.0,
    main1: "AND EVERY DECISION",
    main2: "LEAVES A SIGNAL.",
    support: "WHAT CUSTOMERS CHOOSE. WHAT TEAMS DELIVER.",
    variant: 'signal'
  },
  {
    id: 5,
    start: 10.3,
    end: 12.5,
    main1: "BEHIND EVERY SERVE",
    main2: "IS A BUSINESS IN MOTION.",
    support: "DEMAND. OPERATIONS. PERFORMANCE.",
    variant: 'confident'
  },
  {
    id: 6,
    start: 13.0,
    end: 15.5,
    main1: "THE REAL CHALLENGE",
    main2: "IS SEEING THE WHOLE PICTURE.",
    variant: 'titleCard'
  },
  {
    id: 7,
    start: 16.5,
    end: 18.0,
    main1: "BECAUSE EVERY SERVE TELLS A STORY.",
    variant: 'fadeOnly'
  }
];

export function CinematicLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnToReveal = location.state?.returnToReveal === true;

  const [currentTime, setCurrentTime] = useState(returnToReveal ? 18 : 0);
  const [finalRevealStage, setFinalRevealStage] = useState(returnToReveal ? 4 : 0); // 0 to 4
  const [isEntering, setIsEntering] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(!returnToReveal);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    if (returnToReveal && videoRef.current) {
      const video = videoRef.current;
      const handleLoadedMetadata = () => {
        video.currentTime = 18;
        setIsVideoReady(true);
      };
      
      if (video.readyState >= 1) {
        video.currentTime = 18;
        setIsVideoReady(true);
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [returnToReveal]);

  useEffect(() => {
    const updateTime = () => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        setCurrentTime(time);
        
        if (time >= 18) {
          setFinalRevealStage(prev => {
            if (prev === 4) return prev;
            if (time >= 22.5) return 4;
            if (time >= 20.8) return 3;
            if (time >= 19.5) return 2;
            if (time >= 18.0) return 1;
            return prev;
          });
        }
      }
      rafRef.current = requestAnimationFrame(updateTime);
    };
    rafRef.current = requestAnimationFrame(updateTime);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    sessionStorage.setItem('brew_buzz_entered', 'true');
    
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 30 && finalRevealStage >= 4 && !isEntering) {
      handleEnter();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (diff > 40 && finalRevealStage >= 4 && !isEntering) {
      handleEnter();
      touchStartY.current = 0;
    }
  };

  const isFinalPhase = finalRevealStage > 0;

  
  return (
    <div className={cn(
      "relative w-screen h-screen overflow-hidden bg-[#0a0a0a] selection:bg-[#c89f70] selection:text-white transition-opacity duration-700",
      isVideoReady ? "opacity-100" : "opacity-0"
    )} onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
      {/* Brand Identifiers (Top Left / Right) */}
      <div 
        className={cn(
          "absolute top-8 left-8 z-20 transition-opacity duration-1000",
          (isFinalPhase || isEntering) ? "opacity-0" : "opacity-40"
        )}
      >
        <span className="text-white text-[10px] font-medium tracking-[0.3em] uppercase">BREW BUZZ</span>
      </div>
      <div 
        className={cn(
          "absolute top-8 right-8 z-20 transition-opacity duration-1000",
          (isFinalPhase || isEntering) ? "opacity-0" : "opacity-40"
        )}
      >
        <span className="text-white text-[10px] font-medium tracking-[0.3em] uppercase">FRANCHISE INTELLIGENCE</span>
      </div>

      {/* Progress Line */}
      <div 
        className={cn(
          "absolute bottom-12 left-8 md:left-[8vw] z-20 flex items-center space-x-4 transition-opacity duration-1000",
          (isFinalPhase || isEntering) ? "opacity-0" : "opacity-60"
        )}
      >
        <span className="text-white text-[9px] font-bold tracking-[0.2em]">CRAFT</span>
        <div className="w-24 md:w-48 h-[1px] bg-white/20 relative">
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"
            style={{ 
              left: `${Math.min((currentTime / 18) * 100, 100)}%`,
              transition: 'left 0.1s linear'
            }}
          />
        </div>
      </div>

      {/* Video Background */}
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-in-out object-[center_center] md:object-center",
          isEntering && "scale-110"
        )}
        autoPlay
        muted
        playsInline
        loop
      >
        <source src="/videos/brew-buzz-cinematic.mp4.mp4" type="video/mp4" />
      </video>

      {/* Dynamic Vignette / Gradient */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-[3000ms] ease-in-out",
          "bg-gradient-to-r from-black/90 via-black/40 to-transparent",
          (currentTime >= 15 || isFinalPhase) ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Entrance Dark Overlay */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none bg-[#1a1410] transition-opacity duration-700 ease-in-out z-30",
          isEntering ? "opacity-100" : "opacity-0"
        )}
      />

      {/* STORYTELLING UI LAYER (0 - 18s) */}
      {!isFinalPhase && (
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-[8vw] pointer-events-none">
          {STORY_BEATS.map(beat => {
            const isActive = currentTime >= beat.start && currentTime <= beat.end;
            
            return (
              <div 
                key={beat.id} 
                className={cn(
                  "absolute flex flex-col justify-center max-w-xl md:max-w-3xl",
                  "transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isActive ? "opacity-100" : "opacity-0 pointer-events-none",
                  !isActive && currentTime > beat.end ? "-translate-y-4 blur-sm" : ""
                )}
              >
                {/* 1. fadeUp variant */}
                {beat.variant === 'fadeUp' && (
                  <>
                    <h2 className={cn("text-white/80 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-4 transition-all duration-1000 delay-[200ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                      {beat.main1}
                    </h2>
                    <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-1000 delay-[400ms]", isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-6 blur-md")}>
                      {beat.main2}
                    </h3>
                    {beat.support && (
                      <p className={cn("text-[#c89f70] text-sm md:text-base font-medium mt-6 tracking-wide transition-all duration-1000 delay-[1000ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                        {beat.support}
                      </p>
                    )}
                  </>
                )}

                {/* 2. mask variant */}
                {beat.variant === 'mask' && (
                  <>
                    <div className="overflow-hidden mb-1">
                      <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-1000 delay-[200ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full")}>
                        {beat.main1}
                      </h3>
                    </div>
                    <div className="overflow-hidden">
                      <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-1000 delay-[350ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full")}>
                        {beat.main2}
                      </h3>
                    </div>
                    {beat.support && (
                      <p className={cn("text-[#c89f70] text-xs md:text-sm font-bold mt-6 tracking-[0.15em] uppercase transition-all duration-1000 delay-[800ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                        {beat.support}
                      </p>
                    )}
                  </>
                )}

                {/* 3. stagger variant */}
                {beat.variant === 'stagger' && (
                  <>
                    <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-1000 delay-[200ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
                      {beat.main1}
                    </h3>
                    <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-1000 delay-[300ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
                      {beat.main2}
                    </h3>
                    {beat.support && (
                      <p className={cn("text-[#c89f70] text-xs md:text-sm font-bold mt-6 uppercase transition-all duration-1000 delay-[600ms]", isActive ? "opacity-100 tracking-[0.15em]" : "opacity-0 tracking-[0.3em]")}>
                        {beat.support}
                      </p>
                    )}
                  </>
                )}

                {/* 4. signal variant */}
                {beat.variant === 'signal' && (
                  <div className="flex items-start">
                    <div className={cn("w-0 h-[1px] bg-[#c89f70] mt-[1.2em] mr-6 transition-all duration-[800ms] delay-[100ms] ease-out", isActive ? "w-12 md:w-16 opacity-100" : "w-0 opacity-0")} />
                    <div>
                      <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-1000 delay-[400ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                        {beat.main1}
                      </h3>
                      <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-1000 delay-[500ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                        {beat.main2}
                      </h3>
                      {beat.support && (
                        <p className={cn("text-white/60 text-xs md:text-sm font-bold mt-6 tracking-[0.1em] uppercase transition-all duration-1000 delay-[800ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                          {beat.support}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. confident variant */}
                {beat.variant === 'confident' && (
                  <>
                    <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-bold leading-tight tracking-tight transition-all duration-[1000ms] delay-[100ms]", isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-[25px] blur-[2px]")}>
                      {beat.main1}
                    </h3>
                    <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-bold leading-tight tracking-tight transition-all duration-[1000ms] delay-[200ms]", isActive ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-[25px] blur-[2px]")}>
                      {beat.main2}
                    </h3>
                    {beat.support && (
                      <p className={cn("text-[#c89f70] text-xs md:text-sm font-bold mt-6 uppercase transition-all duration-[1000ms] delay-[450ms]", isActive ? "opacity-100 tracking-[0.15em]" : "opacity-0 tracking-[0.2em]")}>
                        {beat.support}
                      </p>
                    )}
                  </>
                )}

                {/* 6. titleCard variant */}
                {beat.variant === 'titleCard' && (
                  <>
                    <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-[1200ms] delay-[100ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[20px]")}>
                      {beat.main1}
                    </h3>
                    <h3 className={cn("text-white text-3xl md:text-[clamp(2rem,4vw,4.5rem)] font-light leading-tight tracking-tight transition-all duration-[1200ms] delay-[220ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[20px]")}>
                      {beat.main2}
                    </h3>
                  </>
                )}

                {/* 7. fadeOnly variant */}
                {beat.variant === 'fadeOnly' && (
                  <h3 className={cn("text-white text-2xl md:text-4xl font-light leading-tight tracking-tight transition-all duration-[1500ms] delay-[100ms]", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]")}>
                    {beat.main1}
                  </h3>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FINAL BRAND REVEAL (18s+) */}
      <div 
        className={cn(
          "absolute inset-0 flex flex-col justify-center px-8 md:px-[8vw] z-20 transition-opacity duration-700",
          (!isFinalPhase || isEntering) ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="max-w-2xl">
          <h1 
            className={cn(
              "text-5xl md:text-7xl font-extrabold tracking-tight text-white transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              finalRevealStage >= 1 ? "opacity-100 scale-100 translate-y-0 blur-0" : "opacity-0 scale-[0.97] translate-y-[12px] blur-[4px]"
            )}
          >
            BREW BUZZ
          </h1>
          
          <p 
            className={cn(
              "text-lg md:text-2xl font-medium text-[#c89f70] mt-4 tracking-wide transition-all duration-1000 ease-out",
              finalRevealStage >= 2 ? "opacity-100 translate-y-0 tracking-[0.1em]" : "opacity-0 translate-y-4 tracking-[0.2em]"
            )}
          >
            Pizza &bull; Coffee &bull; Intelligence
          </p>
          
          <p 
            className={cn(
              "text-xl md:text-3xl font-light text-white mt-8 mb-12 transition-all duration-[1200ms] ease-out",
              finalRevealStage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Where craft meets intelligence.<br/>
            <span className="text-white/70 block mt-2">See your franchise differently.</span>
          </p>
          
          <button
            onClick={handleEnter}
            disabled={isEntering || finalRevealStage < 4}
            className={cn(
              "group inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 border transition-all duration-[1000ms] ease-out focus:outline-none focus:ring-2 focus:ring-[#c89f70] focus:ring-offset-2 focus:ring-offset-black cursor-pointer backdrop-blur-sm px-8 py-4 rounded-full text-white text-sm md:text-base font-bold uppercase tracking-widest",
              finalRevealStage >= 4 ? "opacity-100 translate-y-0 border-white/30" : "opacity-0 translate-y-[12px] border-white/0 pointer-events-none"
            )}
          >
            <span>Enter Brew Buzz</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <div 
          className={cn(
            "absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-1000 ease-out delay-[800ms]",
            finalRevealStage >= 4 ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          <span className="text-white text-[9px] font-bold tracking-[0.2em] uppercase mb-3 animate-pulse">Scroll to enter</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/80 to-transparent" />
        </div>
      </div>
    </div>
  );
}
