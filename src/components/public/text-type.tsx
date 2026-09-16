'use client';

import {
  type ElementType,
  useEffect,
  useRef,
  useMemo,
  createElement,
} from 'react';

interface TextTypeProps {
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string | React.ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
}

/**
 * TextType — typing animation component.
 * Uses refs + setTimeout loop to avoid per-character React re-renders.
 * Cursor blink uses pure CSS animation (no GSAP).
 */
const TextType = ({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}: TextTypeProps & React.HTMLAttributes<HTMLElement>) => {
  const textSpanRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  // All animation state lives in refs — zero re-renders during typing
  useEffect(() => {
    const textSpan = textSpanRef.current;
    if (!textSpan) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    let textIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let displayed = '';
    let started = false;

    const getSpeed = () => {
      if (deleting) return deletingSpeed;
      if (variableSpeed) {
        const { min, max } = variableSpeed;
        return Math.random() * (max - min) + min;
      }
      return typingSpeed;
    };

    const updateColor = () => {
      if (textColors.length > 0) {
        textSpan.style.color = textColors[textIdx % textColors.length];
      }
    };

    const tick = () => {
      if (cancelled) return;
      const raw = textArray[textIdx];
      const current = reverseMode ? raw.split('').reverse().join('') : raw;

      if (deleting) {
        if (displayed.length === 0) {
          deleting = false;
          if (textIdx === textArray.length - 1 && !loop) return;
          onSentenceComplete?.(raw, textIdx);
          textIdx = (textIdx + 1) % textArray.length;
          charIdx = 0;
          updateColor();
          timeout = setTimeout(tick, pauseDuration / 4);
        } else {
          displayed = displayed.slice(0, -1);
          textSpan.textContent = displayed;
          timeout = setTimeout(tick, deletingSpeed);
        }
      } else {
        if (charIdx < current.length) {
          displayed += current[charIdx];
          charIdx++;
          textSpan.textContent = displayed;
          timeout = setTimeout(tick, getSpeed());
        } else if (textArray.length >= 1) {
          if (!loop && textIdx === textArray.length - 1) return;
          timeout = setTimeout(() => {
            deleting = true;
            tick();
          }, pauseDuration);
        }
      }
    };

    // Start on visible via IntersectionObserver, or immediately
    const begin = () => {
      if (started || cancelled) return;
      started = true;
      updateColor();
      timeout = setTimeout(tick, initialDelay);
    };

    let observer: IntersectionObserver | null = null;
    if (startOnVisible && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) begin(); },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
    } else {
      begin();
    }

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      observer?.disconnect();
    };
  }, [
    textArray,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop,
    initialDelay,
    startOnVisible,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
    textColors,
  ]);

  const blinkStyle = useMemo(() => ({
    animationName: 'texttype-blink',
    animationDuration: `${cursorBlinkDuration * 2}s`,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
  } as React.CSSProperties), [cursorBlinkDuration]);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...props,
    },
    <>
      <style>{`@keyframes texttype-blink{0%{opacity:1}100%{opacity:0}}`}</style>
      <span ref={textSpanRef} className="inline" />
    </>,
    showCursor && (
      <span
        className={`ml-0.5 inline-block ${cursorClassName}`}
        style={blinkStyle}
      >
        {cursorCharacter}
      </span>
    )
  );
};

export default TextType;
