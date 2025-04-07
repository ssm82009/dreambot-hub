
import { useState, useEffect } from 'react';

interface StreamingTextOptions {
  delay?: number;
  enabled?: boolean;
}

export function useStreamingText(fullText: string, options: StreamingTextOptions = {}) {
  const { delay = 30, enabled = true } = options;
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Reset when text changes
  useEffect(() => {
    setText('');
    setIndex(0);
    setIsDone(false);
  }, [fullText]);

  useEffect(() => {
    // If streaming is disabled, show full text immediately
    if (!enabled) {
      setText(fullText || '');
      setIsDone(true);
      return;
    }

    // If no text or already finished, return
    if (!fullText || index >= fullText.length) {
      if (fullText && index >= fullText.length) {
        setIsDone(true);
      }
      return;
    }

    console.log('Streaming text, current index:', index, 'of', fullText.length);

    // Setup interval to add characters over time
    const intervalId = setInterval(() => {
      setText(prev => prev + fullText[index]);
      setIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= fullText.length) {
          setIsDone(true);
          clearInterval(intervalId);
        }
        return nextIndex;
      });
    }, delay);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [fullText, index, delay, enabled]);

  return { text, isDone };
}
