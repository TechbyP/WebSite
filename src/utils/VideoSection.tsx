import React, { useEffect, useRef, useState } from "react";

interface VideoSectionProps {
  videoId: string;
  posterSrc: string;
  title?: string;
  aspectRatio?: number; // Add aspect ratio prop (width/height, e.g. 16/9)
}

const VideoSection: React.FC<VideoSectionProps> = ({ 
  videoId, 
  posterSrc, 
  title, 
  aspectRatio = 16/9 // Default to 16:9 aspect ratio
}) => {
  const playerRef = useRef<any>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [containerHeight, setContainerHeight] = useState("80vh");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate height based on aspect ratio for mobile
    const calculateHeight = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (window.innerWidth < 768) { // Mobile devices
          const calculatedHeight = width / aspectRatio;
          setContainerHeight(`${calculatedHeight}px`);
        } else {
          setContainerHeight("80vh"); // Default height for desktop
        }
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [aspectRatio]);

  useEffect(() => {
    // Load YouTube iframe API
    const loadYouTubeAPI = () => {
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
    };

    const createPlayer = () => {
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
            setPlayerReady(true);
          },
          onStateChange: (event: any) => {
            switch (event.data) {
              case 1: // playing
                setIsOverlayVisible(false);
                break;
              case 2: // paused
                setIsOverlayVisible(true);
                break;
            }
          },
        },
      });
    };

    loadYouTubeAPI();

    return () => {
      playerRef.current?.destroy?.();
    };
  }, [videoId]);

  const handlePlayClick = () => {
    if (playerReady && playerRef.current?.playVideo) {
      playerRef.current.playVideo();
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
        {/* YouTube Player Mount Point */}
        <div
          id={`yt-player-${videoId}`}
          className="absolute inset-0 w-full h-full z-0"
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 z-20 transition-opacity duration-500 ${
            isOverlayVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={posterSrc}
            alt={title || "Video poster"}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.5)" }}
          />
          <div className="absolute inset-0 bg-black/1" />
          <button
            type="button"
            onClick={handlePlayClick}
            className="absolute inset-0 flex flex-col items-center justify-center"
            aria-label="Play Video"
          >
            {/* Play button SVG and Title */}
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