"use client";

import { useEffect, useRef, useState } from "react";
import { FiMic, FiSquare } from "react-icons/fi";

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionEvent = Event & {
  readonly results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type BrowserWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type Props = {
  name: string;
  required?: boolean;
  rows: number;
  placeholder: string;
  className: string;
};

function appendTranscript(currentValue: string, transcript: string) {
  const cleanTranscript = transcript.trim();

  if (!cleanTranscript) {
    return currentValue;
  }

  if (!currentValue.trim()) {
    return cleanTranscript;
  }

  return `${currentValue.trimEnd()} ${cleanTranscript}`;
}

export default function VoiceTextarea({
  name,
  required,
  rows,
  placeholder,
  className,
}: Props) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseValueRef = useRef("");

  useEffect(() => {
    const browserWindow = window as BrowserWindow;
    const Recognition =
      browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;

    if (Recognition) {
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || "en-US";
      recognition.onresult = (event) => {
        let transcript = "";

        for (let index = 0; index < event.results.length; index += 1) {
          transcript += event.results[index][0]?.transcript ?? "";
        }

        setValue(appendTranscript(baseValueRef.current, transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    const supportCheck = window.setTimeout(
      () => setIsSupported(Boolean(Recognition)),
      0,
    );

    return () => {
      window.clearTimeout(supportCheck);
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    baseValueRef.current = value;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        inputMode="text"
        autoCapitalize="sentences"
        autoCorrect="on"
        className={className}
      />

      <div className="flex flex-wrap items-center gap-2">
        {isSupported ? (
          <>
            <button
              type="button"
              onClick={toggleListening}
              className="voice-button inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition"
              aria-pressed={isListening}
            >
              {isListening ? <FiSquare aria-hidden /> : <FiMic aria-hidden />}
              {isListening ? "Stop voice" : "Start voice"}
            </button>

            <p className="text-sm text-muted">
              {isListening
                ? "Listening..."
                : "Use your microphone to fill the answer."}
            </p>
          </>
        ) : (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-muted">
            <span className="sm:hidden">
              Tap the answer field and use the microphone on your keyboard.
            </span>
            <span className="hidden sm:inline">
              Voice button is not supported in this browser. Tap the answer
              field and use the microphone on your keyboard.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
