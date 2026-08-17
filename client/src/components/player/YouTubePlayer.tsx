import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export interface YouTubePlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void; // 0 to 1
}

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  volume: number; // 0 to 1
  isMuted: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  onError?: () => void;
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, isPlaying, volume, isMuted, onTimeUpdate, onDurationChange, onEnded, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const timerRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (playerRef.current?.playVideo) {
          playerRef.current.playVideo();
        }
      },
      pause: () => {
        if (playerRef.current?.pauseVideo) {
          playerRef.current.pauseVideo();
        }
      },
      seekTo: (seconds: number) => {
        if (playerRef.current?.seekTo) {
          playerRef.current.seekTo(seconds, true);
        }
      },
      setVolume: (vol: number) => {
        if (playerRef.current?.setVolume) {
          playerRef.current.setVolume(Math.round(vol * 100));
        }
      },
    }));

    // Load YouTube Iframe API Script once
    useEffect(() => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }, []);

    // Create / Destroy YT.Player when videoId changes
    useEffect(() => {
      if (!videoId) return;

      const initPlayer = () => {
        if (!containerRef.current) return;

        // Destroy previous player instance if any
        if (playerRef.current?.destroy) {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              const dur = event.target.getDuration();
              if (onDurationChange && dur) {
                onDurationChange(dur);
              }
              event.target.setVolume(isMuted ? 0 : Math.round(volume * 100));
              if (isPlaying) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              // YT.PlayerState.ENDED = 0
              if (event.data === 0) {
                if (onEnded) onEnded();
              }
            },
            onError: () => {
              if (onError) onError();
            },
          },
        });
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        const prevReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevReady) prevReady();
          initPlayer();
        };
      }

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (playerRef.current?.destroy) {
          try {
            playerRef.current.destroy();
          } catch (_e) {}
        }
      };
    }, [videoId]);

    // Periodically sync currentTime when playing
    useEffect(() => {
      if (isPlaying) {
        timerRef.current = setInterval(() => {
          if (playerRef.current?.getCurrentTime && onTimeUpdate) {
            const time = playerRef.current.getCurrentTime();
            if (typeof time === 'number') {
              onTimeUpdate(time);
            }
          }
        }, 500);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [isPlaying, onTimeUpdate]);

    // Handle isPlaying prop change
    useEffect(() => {
      if (!playerRef.current) return;
      if (isPlaying && playerRef.current.playVideo) {
        playerRef.current.playVideo();
      } else if (!isPlaying && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    }, [isPlaying]);

    // Handle volume change
    useEffect(() => {
      if (playerRef.current?.setVolume) {
        playerRef.current.setVolume(isMuted ? 0 : Math.round(volume * 100));
      }
    }, [volume, isMuted]);

    return (
      <div className="w-full h-full rounded-2xl overflow-hidden pointer-events-none">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';
