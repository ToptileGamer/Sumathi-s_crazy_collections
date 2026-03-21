import "../styles/policies.css";

const Privacy = () => (
  <section className="policy-page">
    <div className="policy-header">
      <h2>Privacy Policy</h2>
      <p>Your trust matters. Here’s how we handle your data.</p>
    </div>
    <div className="policy-card">
      <h3>What We Collect</h3>
      <p>We collect your name, email, phone, and shipping address to fulfill orders.</p>
    </div>
    <div className="policy-card">
      <h3>How We Use It</h3>
      <p>We only use your details for order processing, delivery updates, and support.</p>
    </div>
    <div className="policy-card">
      <h3>Security</h3>
      <p>We protect your data and never sell your information to third parties.</p>
    </div>
  </section>
);

export default Privacy;
