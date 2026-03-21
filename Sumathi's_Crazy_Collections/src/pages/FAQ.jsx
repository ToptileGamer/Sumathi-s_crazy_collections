import "../styles/policies.css";

const FAQ = () => (
  <section className="policy-page">
    <div className="policy-header">
      <h2>Frequently Asked Questions</h2>
      <p>Everything you need to know before placing an order.</p>
    </div>
    <div className="policy-grid">
      {[
        {
          title: "How long does it take to ship?",
          body: "Ready-to-ship orders leave within 2 business days. Custom orders take 3-5 days to create.",
        },
        {
          title: "Can I customize colors?",
          body: "Yes! Use the custom order form to choose colors, charms, and style preferences.",
        },
        {
          title: "Do you take bulk orders?",
          body: "We do! Reach out via the contact page for bulk pricing and timelines.",
        },
        {
          title: "How do I track my order?",
          body: "We share tracking details by email once your parcel is dispatched.",
        },
      ].map((item) => (
        <article key={item.title} className="policy-card">
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  </section>
);

export default FAQ;
