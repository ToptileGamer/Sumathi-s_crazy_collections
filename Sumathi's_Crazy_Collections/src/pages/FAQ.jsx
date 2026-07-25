import { motion } from "framer-motion";
import "../styles/policies.css";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };

const FAQ = () => (
  <section className="policy-page">
    <div className="policy-header">
      <span className="sh__sub"><span className="sh__accent-line" />Got Questions?</span>
      <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        Frequently Asked Questions
      </motion.h2>
      <p>Everything you need to know before placing an order.</p>
    </div>
    <div className="policy-grid">
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
        {[
          { title: "How long does it take to ship?", body: "Ready-to-ship orders leave within 2 business days. Custom orders take 3-5 days to create." },
          { title: "Can I customize colors?", body: "Yes! Use the custom order form to choose colors, charms, and style preferences." },
          { title: "Do you take bulk orders?", body: "We do! Reach out via the contact page for bulk pricing and timelines." },
          { title: "How do I track my order?", body: "We share tracking details by email once your parcel is dispatched." },
        ].map((item) => (
          <motion.article key={item.title} className="policy-card" variants={fadeUp}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </motion.article>
        ))}
      </motion.div>
    </div>
  </section>
);

export default FAQ;
