import { motion } from "framer-motion";
import "../styles/policies.css";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const Shipping = () => (
  <section className="policy-page">
    <div className="policy-header">
      <span className="sh__sub"><span className="sh__accent-line" />Delivery Info</span>
      <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        Shipping & Delivery
      </motion.h2>
      <p>We ship across India with reliable delivery partners.</p>
    </div>
    <motion.div className="policy-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <h3>Delivery Timelines</h3>
      <ul>
        <li>Ready-to-ship items: 2-4 business days.</li>
        <li>Custom orders: 5-7 business days.</li>
        <li>Metro cities: 2-3 business days after dispatch.</li>
      </ul>
    </motion.div>
    <motion.div className="policy-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <h3>Shipping Charges</h3>
      <p>Flat ₹99 shipping on orders under ₹999. Free shipping on orders above ₹999.</p>
    </motion.div>
  </section>
);

export default Shipping;
