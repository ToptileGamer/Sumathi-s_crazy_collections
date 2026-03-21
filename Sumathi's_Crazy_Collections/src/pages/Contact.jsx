import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "../styles/contact.css";

const Contact = () => {
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendingOrder, setSendingOrder] = useState(false);

  // Custom Order States
  const [numColors, setNumColors] = useState(1);
  const [colorValues, setColorValues] = useState([""]);
  const [style, setStyle] = useState("");

  const styleOptions = [
    "Classic",
    "Elegant",
    "Cute",
    "Trendy",
    "Festive",
  ];

  const handleColorChange = (index, value) => {
    const newColors = [...colorValues];
    newColors[index] = value;
    setColorValues(newColors);
  };

  // ========== Message Form ==========
  const handleMessageSubmit = (e) => {
    e.preventDefault();
    setSendingMessage(true);

    emailjs
      .sendForm(
        "service_4lpetkt",
        "template_4ub9i3o",
        e.target,
        "Lwd5HxsRkUsjjY_lt"
      )
      .then(
        () => {
          alert("Thank you! Your message has been sent 💖");
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
        "service_4lpetkt",
        "template_es23kwy",
        e.target,
        "Lwd5HxsRkUsjjY_lt"
      )
      .then(
        () => {
          alert("Thank you! Your custom order has been sent 💖");
          e.target.reset();
          setNumColors(1);
          setColorValues([""]);
          setStyle("");
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
        Send us a message or place your custom order. We’ll bring your ideas to
        life! 🌸
      </p>

      <div className="contact-wrapper">
        {/* ================= Message Section ================= */}
        <div className="message-section">
          <h3>💌 Send Us a Message</h3>
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
              {sendingMessage ? "Sending..." : "Send Message 💖"}
            </button>
          </form>
        </div>

        {/* ================= Custom Order Section ================= */}
        <div className="custom-order-section">
          <h3>🎀 Place a Custom Order</h3>
          <form onSubmit={handleOrderSubmit} className="contact-form">
            <input type="text" name="name" placeholder="Your Name" required />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
            />

            {/* Preferred Style Dropdown */}
            <label>
              Preferred Style:
              <select
                name="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                required
              >
                <option value="">Select a style</option>
                {styleOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            {/* Number of Colors */}
            <label>
              Number of Colors (1-5):
              <input
                type="number"
                name="numColors"
                min="1"
                max="5"
                value={numColors}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNumColors(val);
                  setColorValues(Array(val).fill(""));
                }}
                required
              />
            </label>

            {/* Dynamic Color Inputs */}
            {colorValues.map((color, index) => (
              <input
                key={index}
                type="text"
                name={`color${index + 1}`}
                placeholder={`Color ${index + 1}`}
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                required
              />
            ))}

            {/* Hidden input for all colors */}
            <input
              type="hidden"
              name="colors"
              value={colorValues.join(", ")}
            />

            {/* Live color preview */}
            <div className="color-preview">
              {colorValues.map((color, index) => (
                <div
                  key={index}
                  className="color-box"
                  style={{ backgroundColor: color || "#fff" }}
                  title={color || "empty"}
                ></div>
              ))}
            </div>

            <textarea
              name="description"
              placeholder="Extra Notes / Description"
              rows="3"
            ></textarea>

            <button type="submit" className="add-to-cart-btn">
              {sendingOrder ? "Sending..." : "Send Custom Order 💖"}
            </button>
          </form>
        </div>
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
