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
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
        },
        events: {
          onReady: (event) => {
            const player = event.target;
            player.unMute();
            player.setVolume(volume);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleNextSong();
            }
          }
        }
      });
    }
  }, [currentSong, isPlaying, volume]);

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
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleSongChange = (index) => {
    if (playerRef.current) {
      setCurrentSong(index);
      setProgress(0);
      setDuration(0);
      playerRef.current.loadVideoById(playlist[index].youtubeId);
      playerRef.current.playVideo();
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
    
    if (playerRef.current?.getPlayerState) {
      const player = playerRef.current;
      player.unMute();
      player.setVolume(newVolume);
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
    const seekBar = e.currentTarget;
    const rect = seekBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekPosition = (x / rect.width) * duration;
    
    if (playerRef.current) {
      playerRef.current.seekTo(seekPosition, true);
      setProgress(seekPosition);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div id="youtube-player"></div>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Bunniify
            </h1>
            <span className="text-4xl">🐰</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-2xl">🎧</span>
            <div className="flex items-center gap-4">
              <Volume2 className="text-pink-600" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-pink-200 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
          <canvas 
            ref={canvasRef} 
            className="w-full h-48 rounded-xl"
            width={800}
            height={200}
          />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src={playlist[currentSong].thumbnail}
                alt="Video thumbnail" 
                className="w-24 h-24 rounded-2xl shadow-md"
              />
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {playlist[currentSong].title}
                  </h2>
                  <span className="text-2xl">🐰</span>
                </div>
                <p className="text-gray-600">{playlist[currentSong].artist}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-8 mb-6">
              <button 
                className={`text-pink-600 hover:text-pink-700 transition-colors ${isShuffle ? 'text-purple-600' : ''}`}
                onClick={toggleShuffle}
              >
                <Shuffle size={20} />
              </button>
              <button 
                className="text-pink-600 hover:text-pink-700 transition-colors"
                onClick={handlePreviousSong}
              >
                <SkipBack size={24} />
              </button>
              <button 
                className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:from-pink-600 hover:to-purple-600 transition-colors shadow-lg"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>
              <button 
                className="text-pink-600 hover:text-pink-700 transition-colors"
                onClick={handleNextSong}
              >
                <SkipForward size={24} />
              </button>
              <button className="text-pink-600 hover:text-pink-700 transition-colors">
                <Repeat size={20} />
              </button>
            </div>

            <div className="w-full space-y-2">
              <div 
                className="w-full bg-pink-100 rounded-full h-2 cursor-pointer relative"
                onClick={handleSeek}
              >
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
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Playlist
            </h3>
            <span className="text-xl">🐰🎵✨</span>
          </div>
          <div className="space-y-4">
            {playlist.map((song, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl hover:bg-pink-50 cursor-pointer transition-colors
                  ${index === currentSong ? 'bg-gradient-to-r from-pink-50 to-purple-50' : ''}`}
                onClick={() => handleSongChange(index)}
              >
                <div className="flex items-center space-x-4">
                  <span className="w-6 text-pink-600 font-medium">{index + 1}</span>
                  <img 
                    src={song.thumbnail}
                    alt={`${song.title} thumbnail`} 
                    className="w-12 h-12 rounded-lg shadow-sm"
                  />
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">{song.title}</p>
                    {index === currentSong && <span>🐰</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className={`text-${song.liked ? 'pink' : 'gray'}-500 hover:text-pink-600 transition-colors`}>
                    <Heart fill={song.liked ? 'currentColor' : 'none'} size={20} />
                  </button>
                  <span className="text-gray-500">{song.duration}</span>
                  <button className="text-gray-500 hover:text-pink-600 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BunniifyApp;