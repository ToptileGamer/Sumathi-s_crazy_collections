// useScrollReveal.js
// Lightweight hook for scroll-triggered fade-in animations.
// Uses IntersectionObserver with a single shared observer.
// On mobile (< 768px), returns isVisible=true immediately to keep things lightweight.

import { useEffect, useRef, useState } from "react";

const SHARED_OPTIONS = { threshold: 0.08, rootMargin: "0px 0px -40px 0px" };
const observerMap = new Map();
let sharedObserver = null;

function getObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const cbs = observerMap.get(entry.target);
        if (cbs) cbs.forEach((fn) => fn(entry.isIntersecting));
      });
    }, SHARED_OPTIONS);
  }
  return sharedObserver;
}

/**
 * @param {{ once?: boolean, threshold?: number }} opts
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
export default function useScrollReveal(opts = {}) {
  const { once = true } = opts;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Mobile skip — report visible immediately, no observer overhead
    if (window.innerWidth < 768) {
      setIsVisible(true);
      return;
    }

    const observer = getObserver();
    const listeners = observerMap.get(el) || new Set();
    const handler = (intersecting) => {
      if (intersecting) {
        setIsVisible(true);
        if (once) {
          listeners.delete(handler);
          if (listeners.size === 0) {
            observer.unobserve(el);
            observerMap.delete(el);
          }
        }
      } else if (!once) {
        setIsVisible(false);
      }
    };

    listeners.add(handler);
    observerMap.set(el, listeners);
    observer.observe(el);

    return () => {
      listeners.delete(handler);
      if (listeners.size === 0) {
        observer.unobserve(el);
        observerMap.delete(el);
      }
    };
  }, [once]);

  return { ref, isVisible };
}
