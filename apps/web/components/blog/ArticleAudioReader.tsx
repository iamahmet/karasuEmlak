'use client';

import { useState, useEffect } from 'react';
import { Volume2, Square, Play, Pause } from 'lucide-react';
import { Button } from '@karasu/ui';

export function ArticleAudioReader({ title, content }: { title: string; content?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(false);

  // To avoid hydrating errors / checking window only on client
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      // Clean up on unmount or un-render
      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const getTextToRead = () => {
    let rawText = title + '. ';
    if (content) {
      // Remove HTML tags quickly
      const temporalDivElement = document.createElement('div');
      temporalDivElement.innerHTML = content;
      rawText += temporalDivElement.textContent || temporalDivElement.innerText || '';
    }
    return rawText;
  };

  const handlePlay = () => {
    if (!supported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // New play
    window.speechSynthesis.cancel();

    const textToRead = getTextToRead();
    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;

    // Add event listeners for natural ending
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-2 p-3 my-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50 transition-all">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400">
        <Volume2 className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Makaleyi Dinle</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">Yapay zeka seslendirmesi</p>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {!isPlaying && !isPaused ? (
          <Button variant="ghost" size="sm" onClick={handlePlay} className="h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:bg-blue-600 dark:hover:bg-blue-700">
            <Play className="h-4 w-4 mr-1.5" />
            Dinle
          </Button>
        ) : (
          <>
            {isPlaying ? (
              <Button variant="ghost" size="icon" onClick={handlePause} className="h-8 w-8 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50">
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={handlePlay} className="h-8 w-8 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50">
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleStop} className="h-8 w-8 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
              <Square className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
