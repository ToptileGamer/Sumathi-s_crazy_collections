const About = () => (
  <section className="about-section">
    <h2>About Sumathi's Crazy Collections</h2>
    <p>
      We started our journey with a love for handmade accessories and a dream to
      bring affordable, joyful pieces to every wardrobe. Each bracelet and earring
      is crafted with care, combining playful colors and thoughtful charms to make
      your everyday style feel extra special.
    </p>

    <div className="team-grid">
      {["Design Studio", "Quality & Packaging", "Customer Happiness"].map((team) => (
        <div key={team} className="team-card">
          <h3>{team}</h3>
          <p>
            A dedicated crew ensuring every order is beautiful, secure, and ready
            to gift.
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default About;
