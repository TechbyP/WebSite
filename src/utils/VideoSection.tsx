import React, { useEffect, useRef, useState } from "react";

interface VideoSectionProps {
  videoId: string;
  posterSrc: string;
  title?: string;
  aspectRatio?: number; // width / height, e.g., 16/9
}

const VideoSection: React.FC<VideoSectionProps> = ({
  videoId,
  posterSrc,
  title,
  aspectRatio = 16 / 9,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [containerHeight, setContainerHeight] = useState("80vh");
  const [showIframe, setShowIframe] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  // Responsive height
  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = window.innerWidth < 768 ? width / aspectRatio : window.innerHeight * 0.8;
        setContainerHeight(`${height}px`);
      }
    };
    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, [aspectRatio]);

  // Load YouTube API and create player only once
  useEffect(() => {
    if (!showIframe) return;

    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);

      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        createPlayer();
      };
    }

    function createPlayer() {
      if (!playerRef.current) {
        playerRef.current = new (window as any).YT.Player(`yt-player-${videoId}`, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              /* nothing special needed here */
            },
            onStateChange: (event: any) => {
              if (event.data === 1) setIsOverlayVisible(false); // playing
              if (event.data === 2) setIsOverlayVisible(true);  // paused
            },
          },
        });
      }
    }
  }, [showIframe, videoId]);

  // Play video when overlay clicked
  const handlePlayClick = () => {
    if (!showIframe) {
      setShowIframe(true); // first click: show iframe
    }
    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo(); // subsequent clicks
    }
  };

  return (
    <section
      id="demo"
      className="relative mt-6 md:mt-12 w-full flex items-center justify-center"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-[1280px] mx-auto rounded-xl overflow-hidden shadow-lg bg-black ml-2 mr-2"
        style={{ height: containerHeight }}
      >
        {/* YouTube Player Mount */}
        {showIframe && (
          <div id={`yt-player-${videoId}`} className="absolute inset-0 w-full h-full z-0" />
        )}

        {/* Overlay: always in DOM, fade in/out */}
        <div
          className={`absolute inset-0 z-20 transition-opacity duration-500 ${isOverlayVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
          <img
            src={posterSrc}
            alt={title || "Video poster"}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            style={{ filter: "brightness(0.5)" }}
          />
          <div className="absolute inset-0 bg-black/10" />
          <button
            type="button"
            onClick={handlePlayClick}
            className="absolute inset-0 flex flex-col items-center justify-center"
            aria-label="Play Video"
          >
            <svg
              className="w-20 h-20 text-white opacity-80 drop-shadow-lg border-2 border-white rounded-full hover:scale-150 transition-transform duration-300 animate-pulse-scale"
              fill="currentColor"
              viewBox="0 0 64 64"
            >
              <circle cx="32" cy="32" r="32" fill="orange" opacity="0.5" />
              <polygon points="23,20 47,32 23,44" fill="white" />
            </svg>
            <span className="mt-9 text-white text-4xl sm:text-5xl font-black select-none uppercase text-center">
              {title}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
