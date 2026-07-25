import { motion } from "framer-motion";
import "../styles/policies.css";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const Terms = () => (
  <section className="policy-page">
    <div className="policy-header">
      <span className="sh__sub"><span className="sh__accent-line" />Legal</span>
      <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        Terms & Conditions
      </motion.h2>
      <p>Please read these terms before placing an order.</p>
    </div>
    {[
      { title: "Orders", body: "Orders are confirmed once payment is received and you get a confirmation email." },
      { title: "Custom Designs", body: "Custom orders are handcrafted based on your inputs and may vary slightly." },
      { title: "Pricing", body: "All prices are listed in INR and include applicable taxes unless stated otherwise." },
    ].map((item) => (
      <motion.div key={item.title} className="policy-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </motion.div>
    ))}
  </section>
);

export default Terms;
