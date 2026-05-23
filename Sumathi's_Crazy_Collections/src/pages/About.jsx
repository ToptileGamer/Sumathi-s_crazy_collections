import React from "react";
import ScrollReveal from "../components/ScrollReveal";
import "../styles/about.css";
import aboutimg from "../assets/aboutimg.jpg";

const About = () => (
  <div className="about-page-container">
    <section className="about-hero-section">
      <div className="about-hero-content">
        <h1 className="about-title">Our Story</h1>
        <p className="about-subtitle">
          Crafting joy, one piece at a time. Discover the passion behind Sumathi's Crazy Collections.
        </p>
      </div>
    </section>

    <ScrollReveal as="section" className="about-mission-section">
      <div className="mission-content">
        <h2>Handmade with Love</h2>
        <p>
          We started our journey with a love for handmade accessories and a dream to
          bring affordable, joyful pieces to every wardrobe. Each bracelet and earring
          is crafted with care, combining playful colors and thoughtful charms to make
          your everyday style feel extra special.
        </p>
      </div>
      <div className="mission-image-wrapper">
        <img src={aboutimg} alt="Artisan crafting jewelry" className="mission-image" />  
      </div>
    </ScrollReveal>

    <ScrollReveal as="section" className="about-team-section">
      <h2>The Hands Behind the Craft</h2>
      <div className="about-team-grid">
        {[
          { name: "Design Studio", icon: "✨", desc: "Where colors meet creativity and new ideas are born." },
          { name: "Quality & Packaging", icon: "🎀", desc: "Ensuring every order is beautiful, secure, and ready to gift." },
          { name: "Customer Happiness", icon: "💖", desc: "Dedicated to bringing a smile to your face with every purchase." }
        ].map((team) => (
          <div key={team.name} className="about-team-card">
            <div className="team-icon">{team.icon}</div>
            <h3>{team.name}</h3>
            <p>{team.desc}</p>
          </div>
        ))}
      </div>
    </ScrollReveal>
    
    <ScrollReveal as="section" className="about-stats-section">
       <div className="stat-card">
          <h4>100+</h4>
          <p>Happy Customers</p>
       </div>
       <div className="stat-card">
          <h4>100%</h4>
          <p>Handmade</p>
       </div>
       <div className="stat-card">
          <h4>200+</h4>
          <p>Unique Designs</p>
       </div>
    </ScrollReveal>
  </div>
);

export default About;
