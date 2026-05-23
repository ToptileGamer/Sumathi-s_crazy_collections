// ScrollReveal.jsx
// Wrapper component that fades in content when it scrolls into view (desktop only).
// On mobile (< 768px), children are always visible to keep things lightweight.

import useScrollReveal from "../hooks/useScrollReveal";

/**
 * @param {Object} props
 * @param {string}  [props.as="div"]  — HTML tag to render
 * @param {string}  [props.reveal=""] — animation variant: "fade-in", "scale-in", "slide-left", "slide-right"
 * @param {number}  [props.delay=0]   — delay in 100ms increments (0-6)
 * @param {string}  [props.className=""] — extra classes
 * @param {boolean} [props.stagger=false] — if true, adds a default 200ms stagger delay
 */
export default function ScrollReveal({
  as: Tag = "div",
  reveal = "",
  delay = 0,
  stagger = false,
  className = "",
  children,
  ...rest
}) {
  const { ref, isVisible } = useScrollReveal();

  const dataReveal = reveal || (stagger ? "fade-in" : "");
  const dataDelay = stagger ? 200 : delay * 100;

  return (
    <Tag
      ref={ref}
      data-reveal={dataReveal || undefined}
      data-reveal-delay={dataDelay || undefined}
      className={`${className}${isVisible ? " revealed" : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
