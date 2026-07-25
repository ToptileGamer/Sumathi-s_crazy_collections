import { motion } from "framer-motion";
import "../styles/policies.css";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const Privacy = () => (
  <section className="policy-page">
    <div className="policy-header">
      <span className="sh__sub"><span className="sh__accent-line" />Your Trust Matters</span>
      <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        Privacy Policy
      </motion.h2>
      <p>Your trust matters. Here's how we handle your data.</p>
    </div>
    {[
      { title: "What We Collect", body: "We collect your name, email, phone, and shipping address to fulfill orders." },
      { title: "How We Use It", body: "We only use your details for order processing, delivery updates, and support." },
      { title: "Security", body: "We protect your data and never sell your information to third parties." },
    ].map((item) => (
      <motion.div key={item.title} className="policy-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </motion.div>
    ))}
  </section>
);

export default Privacy;
