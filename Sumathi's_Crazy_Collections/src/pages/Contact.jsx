import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { supabase } from "../lib/supabaseClient";
import BraceletPreview, { TOTAL_BEADS, PENDANT_OPTIONS } from "../components/BraceletPreview";
import "../styles/contact.css";

const STYLE_OPTIONS = ["Classic", "Elegant", "Cute", "Trendy", "Festive"];

// ── Anti-spam settings ─────────────────────────────────────
const MIN_SUBMIT_INTERVAL_MS = 60_000; // 1 message per minute per browser
const RATE_LIMIT_KEY = "scc_contact_last_submit";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

function SectionHeader({ subtitle, title }) {
  return (
    <div className="sh sh--center" style={{ marginBottom: "2rem" }}>
      <motion.span className="sh__sub"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <span className="sh__accent-line" />{subtitle}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
        {title}
      </motion.h2>
    </div>
  );
}

// ── Honeypot: a field that humans never fill, bots do ─────
function HoneypotField() {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
    />
  );
}

// ── Client-side rate limiting (localStorage) ───────────────
function isRateLimited() {
  const last = Number(localStorage.getItem(RATE_LIMIT_KEY) ?? 0);
  return Date.now() - last < MIN_SUBMIT_INTERVAL_MS;
}

function markSubmitted() {
  localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
}

// ── Turnstile widget (rendered only when a site key is set) ─
function TurnstileWidget({ formId, onTokenChange }) {
  const widgetRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const el = document.getElementById(`turnstile-${formId}`);
    if (!el) return;

    const init = () => {
      if (window.turnstile && !widgetRef.current) {
        try {
          widgetRef.current = window.turnstile.render(el, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: "light",
            callback: (token) => onTokenChange?.(token),
            "expired-callback": () => onTokenChange?.(""),
            "error-callback": () => onTokenChange?.(""),
          });
          setReady(true);
        } catch { /* turnstile failed to load — form still works */ }
      }
    };

    if (window.turnstile) { init(); return; }
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
    return () => { if (widgetRef.current) { try { window.turnstile?.remove?.(widgetRef.current); } catch {} widgetRef.current = null; } };
  }, [formId, onTokenChange]);

  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <div className="turnstile-wrap">
      <div id={`turnstile-${formId}`} />
      {!ready && <p className="turnstile-hint">Verifying you're human…</p>}
    </div>
  );
}

const Contact = () => {
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingOrder, setSendingOrder] = useState(false);

  const EMPTY_BEAD = "#e0e0e0";
  const [beadColors, setBeadColors] = useState(Array(TOTAL_BEADS).fill(EMPTY_BEAD));
  const [style, setStyle] = useState("");
  const [pendantType, setPendantType] = useState("heart");

  const handleBeadColorChange = (index, color) => {
    const newColors = [...beadColors];
    newColors[index] = color;
    setBeadColors(newColors);
  };

  // ── Shared guard before sending anything ─────────────────
  const checkBeforeSend = (form) => {
    // Honeypot — silently ignore bot submissions
    if (form.elements["website"]?.value) return { blocked: true, silent: true };

    // EmailJS must be configured
    if (
      !import.meta.env.VITE_EMAILJS_SERVICE_ID ||
      !import.meta.env.VITE_EMAILJS_TEMPLATE_ID ||
      !import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ) {
      return {
        blocked: true,
        message: "Email service is not configured. Please set up environment variables.",
      };
    }

    // Rate limit
    if (isRateLimited()) {
      return {
        blocked: true,
        message: "Please wait a moment before sending another message.",
      };
    }
    return { blocked: false };
  };

  // ── Verify Turnstile token via edge function (if enabled) ─
  const verifyTurnstile = async (token) => {
    if (!TURNSTILE_SITE_KEY) return true; // not configured — skip
    if (!token) return false;
    try {
      const { data, error } = await supabase.functions.invoke("verify-turnstile", {
        body: { token },
      });
      return !error && !!data?.success;
    } catch {
      return false;
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const guard = checkBeforeSend(form);
    if (guard.blocked) {
      if (!guard.silent) alert(guard.message);
      return;
    }

    const token = form.elements["cf-turnstile-response"]?.value ?? "";
    const ok = await verifyTurnstile(token);
    if (!ok) {
      alert("Please complete the human verification.");
      return;
    }
    emailjs
      .sendForm(
        emailjsServiceId,
        emailjsTemplateId,
        e.target,
        { publicKey: emailjsPublicKey }
      )
      .then(
        () => {
          alert("Thank you! Your message has been sent successfully.");
          e.target.reset();
          setSendingMessage(false);
        },
        (err) => {
          console.error(err);
          alert("Oops! Something went wrong. Please try again.");
          setSendingMessage(false);
        }
      );
      alert("Thank you! Your message has been sent successfully.");
      form.reset();
      markSubmitted();
    } catch (err) {
      console.error(err);
      alert("Oops! Something went wrong. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const guard = checkBeforeSend(form);
    if (guard.blocked) {
      if (!guard.silent) alert(guard.message);
      return;
    }
    emailjs
      .sendForm(
        emailjsServiceId,
        emailjsTemplateId,
        e.target,
        { publicKey: emailjsPublicKey }
      )
      .then(
        () => {
          alert("Thank you! Your custom order has been sent successfully.");
          e.target.reset();
          setBeadColors(Array(TOTAL_BEADS).fill(EMPTY_BEAD));
          setStyle("");
          setPendantType("heart");
          setSendingOrder(false);
        },
        (err) => {
          console.error(err);
          alert("Oops! Something went wrong. Please try again.");
          setSendingOrder(false);
        }
      );
      alert("Thank you! Your custom order has been sent successfully.");
      form.reset();
      setBeadColors(Array(TOTAL_BEADS).fill(EMPTY_BEAD));
      setStyle("");
      setPendantType("heart");
      markSubmitted();
    } catch (err) {
      console.error(err);
      alert("Oops! Something went wrong. Please try again.");
    } finally {
      setSendingOrder(false);
    }
  };

  return (
    <section className="contact-section">
      <SectionHeader subtitle="Get in Touch" title="Contact & Custom Orders" />
      <p className="contact-subtext">
        Share your vision or place a bespoke custom order. We are dedicated to bringing your unique ideas to life.
      </p>

      <div className="contact-wrapper">
        {/* ================= Message Section ================= */}
        <motion.div className="message-section" variants={fadeUp} initial="hidden" animate="visible">
          <h3>Send an Inquiry</h3>
          <form onSubmit={handleMessageSubmit} className="contact-form">
            <HoneypotField />
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <textarea name="message" placeholder="Your Message" rows="4"></textarea>
            <TurnstileWidget formId="message" />
            <button type="submit" className="contact-submit-btn">
              {sendingMessage ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>

        {/* ================= Custom Order Section ================= */}
        <motion.div className="custom-order-section" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <h3>
            <span className="custom-order-icon">✦</span>
            Design Your Bracelet
            <span className="custom-order-icon">✦</span>
          </h3>

          <form onSubmit={handleOrderSubmit} className="contact-form">
            <HoneypotField />
            <div className="bracelet-preview-area">
              <BraceletPreview
                beadColors={beadColors}
                onBeadColorChange={handleBeadColorChange}
                pendantType={pendantType}
              />
            </div>

            <div className="custom-order-fields">
              <input type="text" name="name" placeholder="Your Name" required />
              <input type="email" name="email" placeholder="Your Email" required />

              <label>
                Preferred Style
                <select name="style" value={style} onChange={(e) => setStyle(e.target.value)} required>
                  <option value="">Select a style</option>
                  {STYLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              {beadColors.map((color, i) => (
                <input key={i} type="hidden" name={`bead${i + 1}`} value={color} />
              ))}
              <input type="hidden" name="beadColors" value={beadColors.join(", ")} />
              <input type="hidden" name="numBeads" value={TOTAL_BEADS} />

              <label className="pendant-selector-label">
                <span className="pendant-selector-heading">
                  <span className="pendant-icon">✦</span>
                  Pendant at the End
                  <span className="optional-badge">Optional</span>
                </span>
                <div className="pendant-options">
                  <button type="button"
                    className={`pendant-option ${!pendantType ? "pendant-option--active" : ""}`}
                    onClick={() => setPendantType(null)}>None</button>
                  {PENDANT_OPTIONS.map((p) => (
                    <button key={p.id} type="button"
                      className={`pendant-option ${pendantType === p.id ? "pendant-option--active" : ""}`}
                      onClick={() => setPendantType(p.id)}>
                      <span className="pendant-option-icon">{p.icon}</span>
                      <span className="pendant-option-label">{p.label}</span>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="pendantType" value={pendantType || "none"} />
              </label>

              <textarea name="description" placeholder="Extra Notes / Description (optional)" rows="3"></textarea>
            </div>

            <TurnstileWidget formId="order" />
            <button type="submit" className="contact-submit-btn">
              {sendingOrder ? (
                <span className="btn-loading">
                  <span className="btn-spinner" /> Sending...
                </span>
              ) : (
                "Send Custom Order"
              )}
            </button>
          </form>
        </motion.div>
      </div>

      <p className="contact-info">
        You can also DM us on Instagram:{" "}
        <a href="https://instagram.com/sumathiscrazycollection" target="_blank" rel="noopener noreferrer">
          @sumathiscrazycollection
        </a>
      </p>
    </section>
  );
};

export default Contact;
