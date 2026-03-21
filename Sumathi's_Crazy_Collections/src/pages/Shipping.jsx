import "../styles/policies.css";

const Shipping = () => (
  <section className="policy-page">
    <div className="policy-header">
      <h2>Shipping & Delivery</h2>
      <p>We ship across India with reliable delivery partners.</p>
    </div>
    <div className="policy-card">
      <h3>Delivery Timelines</h3>
      <ul>
        <li>Ready-to-ship items: 2-4 business days.</li>
        <li>Custom orders: 5-7 business days.</li>
        <li>Metro cities: 2-3 business days after dispatch.</li>
      </ul>
    </div>
    <div className="policy-card">
      <h3>Shipping Charges</h3>
      <p>Flat ₹59 shipping on orders under ₹999. Free shipping on orders above ₹999.</p>
    </div>
  </section>
);

export default Shipping;
