import React from "react";
import "../styles/profile.css";

const Profile = () => (
  <section className="profile-section">
    <div className="profile-card">
      <h2>🌸 Website Under Development 🌸</h2>
      <p>
        Our website is still in progress — thank you so much for your patience 💖
      </p>
      <p>
        For now, please place your orders through the{" "}
        <a href="/contact" className="profile-link">Contact Form</a> or send us a DM on{" "}
        <a
          href="https://instagram.com/sumathiscrazycollection"
          target="_blank"
          rel="noreferrer"
          className="profile-link"
        >
          Instagram
        </a>.
      </p>
      <p>We truly appreciate your support! 🌷</p>
    </div>
  </section>
);

export default Profile;
