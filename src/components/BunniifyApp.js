import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Share2, Shuffle, Repeat } from 'lucide-react';

const BunniifyApp = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const playerRef = useRef(null);
  const [volume, setVolume] = useState(50);
  const [isShuffle, setIsShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressInterval = useRef(null);

  const playlist = [
    {
      title: "Faghat bekhatere to - Mansour",
      artist: "Viguen",
      duration: "3:21",
      liked: true,
      youtubeId: "BLM0zpOktnM",
      thumbnail: "https://i.ytimg.com/vi/BLM0zpOktnM/hqdefault.jpg"
    }
  ];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeYouTubePlayer = useCallback(() => {
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: playlist[currentSong].youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
        },
        events: {
          onReady: (event) => {
            const player = event.target;
            player.setVolume(volume);
            setDuration(player.getDuration());
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              if (progressInterval.current) {
                clearInterval(progressInterval.current);
              }
              progressInterval.current = setInterval(() => {
                if (playerRef.current) {
                  const currentTime = playerRef.current.getCurrentTime();
                  setProgress(currentTime);
                }
              }, 1000);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              if (progressInterval.current) {
                clearInterval(progressInterval.current);
              }
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (progressInterval.current) {
                clearInterval(progressInterval.current);
              }
              handleNextSong();
            }
          }
        }
      });
    }
  }, [currentSong]);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [initializeYouTubePlayer]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSongChange = (index) => {
    if (playerRef.current) {
      setProgress(0);
      setCurrentSong(index);
      playerRef.current.loadVideoById(playlist[index].youtubeId);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleNextSong = () => {
    const nextIndex = isShuffle 
      ? Math.floor(Math.random() * playlist.length)
      : (currentSong + 1) % playlist.length;
    handleSongChange(nextIndex);
  };

  const handlePreviousSong = () => {
    const prevIndex = currentSong === 0 ? playlist.length - 1 : currentSong - 1;
    handleSongChange(prevIndex);
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const drawEmojiVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const numBunnies = 12;
    const spacing = canvas.width / numBunnies;
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      ctx.fillStyle = 'rgb(253, 242, 248)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numBunnies; i++) {
        const x = spacing/2 + i * spacing;
        const bounce = Math.sin(Date.now() / 500 + i) * 20;
        const y = canvas.height/2 + bounce;
        const size = isPlaying ? 30 + Math.sin(Date.now() / 300 + i) * 10 : 30;
        
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐰', x, y);
      }
    };

    draw();
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      drawEmojiVisualizer();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, drawEmojiVisualizer]);

  const handleSeek = (e) => {
    if (!playerRef.current) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentageClicked = clickPosition / rect.width;
    const seekTime = duration * percentageClicked;
    
    playerRef.current.seekTo(seekTime, true);
    setProgress(seekTime);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        if (window.innerWidth > 768) {
          canvasRef.current.width = 800;
          canvasRef.current.height = 200;
        } 
        else {
          canvasRef.current.width = window.innerWidth - 40;
          canvasRef.current.height = 200;
        }
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white px-4 md:px-8">
      <div className="max-w-3xl mx-auto pt-8 pb-16">
        <div className="relative w-full overflow-hidden bg-white rounded-xl shadow-lg p-4">
          <div className="relative w-full h-[200px] flex items-center justify-center">
            <div className="relative w-[90%] md:w-full max-w-[300px] h-full">
              <img
                src={bunnyEarLeft}
                alt="Left ear"
                className="absolute left-[10%] md:left-0 top-0 w-[35%] md:w-[40%] h-auto object-contain transform-origin-bottom-right animate-ear-left"
              />
              <img
                src={bunnyHead}
                alt="Bunny head"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] md:w-[60%] h-auto object-contain"
              />
              <img
                src={bunnyEarRight}
                alt="Right ear"
                className="absolute right-[10%] md:right-0 top-0 w-[35%] md:w-[40%] h-auto object-contain transform-origin-bottom-left animate-ear-right"
              />
            </div>
          </div>

          <div className="w-full px-2 md:px-0">
            <canvas 
              ref={canvasRef}
              className="rounded-xl mx-auto"
            />
          </div>

          <div className="px-2 md:px-4 space-y-4">
            <div className="w-full space-y-2">
              <div className="w-full bg-pink-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full" 
                  style={{ width: `${(progress / duration) * 100}%` }}
                ></div>
              </div>
              <div className="w-full flex justify-between text-sm text-gray-500">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-4">
                <button className="text-pink-600 hover:text-pink-700 p-1">
                  <Shuffle size={18} />
                </button>
                <button className="text-pink-600 hover:text-pink-700 p-1">
                  <SkipBack size={22} />
                </button>
                <button className="text-pink-600 hover:text-pink-700 p-1">
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button className="text-pink-600 hover:text-pink-700 p-1">
                  <SkipForward size={22} />
                </button>
                <button className="text-pink-600 hover:text-pink-700 p-1">
                  <Repeat size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="text-pink-600 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 md:w-24 h-2 bg-pink-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BunniifyApp;