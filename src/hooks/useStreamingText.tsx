
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

  useEffect(() => {
    // Reset state when fullText changes
    setText('');
    setIndex(0);
    setIsDone(false);
  }, [fullText]);

  useEffect(() => {
    // If disabled or we've already streamed all text, return early
    if (!enabled || !fullText || index >= fullText.length) {
      if (fullText && index >= fullText.length) {
        setIsDone(true);
      }
      return;
    }

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

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fullText, index, delay, enabled]);

  return { text, isDone };
}
