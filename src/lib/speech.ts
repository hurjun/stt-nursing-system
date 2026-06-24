import { useCallback, useEffect, useRef, useState } from 'react';

/* --------------------------- capability checks --------------------------- */

export function getSpeechRecognitionCtor(): { new (): SpeechRecognition } | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export const isSpeechRecognitionSupported = (): boolean => getSpeechRecognitionCtor() !== null;
export const isSpeechSynthesisSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/* ------------------------------ synthesis (TTS) -------------------------- */

/** Speaks `text` via the Web Speech API. Resolves when the utterance ends. */
export function speak(text: string, lang = 'en-US', rate = 1): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function cancelSpeech(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}

/* ----------------------------- recognition (STT) ------------------------- */

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechRecognitionState {
  supported: boolean;
  listening: boolean;
  finalTranscript: string;
  interimTranscript: string;
  confidence: number;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Thin React wrapper around the Web Speech API recognition engine. The thesis
 * benchmarked Google STT for Korean (ko-KR); in the browser the equivalent
 * engine is reached through this interface.
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): SpeechRecognitionState {
  const { lang = 'en-US', continuous = false, interimResults = true } = options;
  const supported = isSpeechRecognitionSupported();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let conf = 0;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const alt = result[0];
        if (result.isFinal) {
          setFinalTranscript((prev) => (prev ? `${prev} ${alt.transcript}` : alt.transcript).trim());
          conf = alt.confidence || conf;
        } else {
          interim += alt.transcript;
        }
      }
      setInterimTranscript(interim);
      if (conf) setConfidence(conf);
    };
    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        /* no-op */
      }
    };
  }, [lang, continuous, interimResults]);

  const start = useCallback(() => {
    setError(null);
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch {
      /* recognition already started */
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);
  }, []);

  return {
    supported,
    listening,
    finalTranscript,
    interimTranscript,
    confidence,
    error,
    start,
    stop,
    reset,
  };
}
