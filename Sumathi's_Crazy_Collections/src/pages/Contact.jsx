import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import ScrollReveal from "../components/ScrollReveal";
import BraceletPreview, { TOTAL_BEADS, PENDANT_OPTIONS } from "../components/BraceletPreview";
import "../styles/contact.css";

const STYLE_OPTIONS = ["Classic", "Elegant", "Cute", "Trendy", "Festive"];

const Contact = () => {
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingOrder, setSendingOrder] = useState(false);

  // Custom Order States — per-bead colors
  const EMPTY_BEAD = "#e0e0e0";
  const [beadColors, setBeadColors] = useState(Array(TOTAL_BEADS).fill(EMPTY_BEAD));
  const [style, setStyle] = useState("");
  const [pendantType, setPendantType] = useState("heart");

  const handleBeadColorChange = (index, color) => {
    const newColors = [...beadColors];
    newColors[index] = color;
    setBeadColors(newColors);
  };

  // ========== Message Form ==========
  const handleMessageSubmit = (e) => {
    e.preventDefault();
    setSendingMessage(true);

    emailjs
      .sendForm(
        "service_hkmu9hw",
        "template_eoj7d9v",
        e.target,
        {
          publicKey: "dTrFGG1s35hxdYEBP",
        }
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
  };

  // ========== Custom Order Form ==========
  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setSendingOrder(true);

    emailjs
      .sendForm(
        "service_hkmu9hw",
        "template_eoj7d9v",
        e.target,
        {
          publicKey: "dTrFGG1s35hxdYEBP",
        }
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
  };

  return (
    <section className="contact-section">
      <h2>Contact & Custom Orders</h2>
      <p className="subtext">
        Share your vision or place a bespoke custom order. We are dedicated to bringing your unique ideas to life.
      </p>

      <div className="contact-wrapper">
        {/* ================= Message Section ================= */}
        <ScrollReveal as="div" className="message-section">
          <h3>Send an Inquiry</h3>
          <form onSubmit={handleMessageSubmit} className="contact-form">
            <input type="text" name="name" placeholder="Your Name" required />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
            ></textarea>
            <button type="submit" className="add-to-cart-btn">
              {sendingMessage ? "Sending..." : "Send Message"}
            </button>
          </form>
        </ScrollReveal>

        {/* ================= Custom Order Section ================= */}
        <ScrollReveal as="div" className="custom-order-section">
          <h3>
            <span className="custom-order-icon">✦</span>
            Design Your Bracelet
            <span className="custom-order-icon">✦</span>
          </h3>

          <form onSubmit={handleOrderSubmit} className="contact-form">
            {/* Live Bracelet Preview */}
            <div className="bracelet-preview-area">
              <BraceletPreview
                beadColors={beadColors}
                onBeadColorChange={handleBeadColorChange}
                pendantType={pendantType}
              />
            </div>

            <div className="custom-order-fields">
              <input type="text" name="name" placeholder="Your Name" required />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
              />

              {/* Preferred Style */}
              <label>
                Preferred Style
                <select
                  name="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  required
                >
                  <option value="">Select a style</option>
                  {STYLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>

              {/* Hidden inputs for bead colors */}
              {beadColors.map((color, i) => (
                <input key={i} type="hidden" name={`bead${i + 1}`} value={color} />
              ))}
              <input type="hidden" name="beadColors" value={beadColors.join(", ")} />
              <input type="hidden" name="numBeads" value={TOTAL_BEADS} />

              {/* Pendant Selector */}
              <label className="pendant-selector-label">
                <span className="pendant-selector-heading">
                  <span className="pendant-icon">✦</span>
                  Pendant at the End
                  <span className="optional-badge">Optional</span>
                </span>
                <div className="pendant-options">
                  <button
                    type="button"
                    className={`pendant-option ${!pendantType ? "pendant-option--active" : ""}`}
                    onClick={() => setPendantType(null)}
                  >
                    None
                  </button>
                  {PENDANT_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`pendant-option ${pendantType === p.id ? "pendant-option--active" : ""}`}
                      onClick={() => setPendantType(p.id)}
                    >
                      <span className="pendant-option-icon">{p.icon}</span>
                      <span className="pendant-option-label">{p.label}</span>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="pendantType" value={pendantType || "none"} />
              </label>

              <textarea
                name="description"
                placeholder="Extra Notes / Description (optional)"
                rows="3"
              ></textarea>
            </div>

            <button type="submit" className="add-to-cart-btn submit-order-btn">
              {sendingOrder ? (
                <span className="btn-loading">
                  <span className="btn-spinner" /> Sending...
                </span>
              ) : (
                "Send Custom Order"
              )}
            </button>
          </form>
        </ScrollReveal>
      </div>

      <p className="contact-info">
        You can also DM us on Instagram:{" "}
        <a
          href="https://instagram.com/sumathiscrazycollection"
          target="_blank"
          rel="noopener noreferrer"
        >
          @sumathiscrazycollection
        </a>
      </p>
    </section>
  );
};

export default Contact;
