import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import TiltCard from "../components/TiltCard";
import "../styles/about.css";
import aboutimg from "../assets/aboutimg.jpg";

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

function AnimatedSection({ children, className, variants = fadeUp }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.section ref={ref} className={className}
      initial="hidden" animate={isInView ? "visible" : "hidden"} variants={variants}>
      {children}
    </motion.section>
  );
}

/* ── Section Header ── */
function SectionHeader({ subtitle, title }) {
  return (
    <div className="sh sh--center">
      <motion.span className="sh__sub"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <span className="sh__accent-line" />{subtitle}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
        {title}
      </motion.h2>
    </div>
  );
}

const About = () => (
  <div className="about-page">
    {/* ── Hero ── */}
    <section className="about-hero">
      <motion.div className="about-hero-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}>
        <motion.div className="about-eyebrow"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}>
          <span /> Our Story
        </motion.div>
        <motion.h1 className="about-title"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          Crafting Joy,<br />
          <span style={{ fontStyle: "italic", background: "linear-gradient(135deg, #B8953A, #D4AF37, #B8953A)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>One Piece at a Time</span>
        </motion.h1>
        <motion.p className="about-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}>
          Discover the passion and artistry behind Sumathi's Crazy Collections.
        </motion.p>
      </motion.div>
    </section>

    {/* ── Mission ── */}
    <AnimatedSection className="about-mission">
      <motion.div className="about-mission-content" variants={fadeUp}>
        <SectionHeader subtitle="Our Mission" title="Handmade with Love" />
        <p>
          We started our journey with a love for handmade accessories and a dream to
          bring affordable, joyful pieces to every wardrobe. Each bracelet and earring
          is crafted with care, combining playful colors and thoughtful charms to make
          your everyday style feel extra special.
        </p>
      </motion.div>
      <motion.div className="about-mission-img" variants={scaleIn}>
        <img src={aboutimg} alt="Artisan crafting jewelry" />
      </motion.div>
    </AnimatedSection>

    {/* ── Team ── */}
    <AnimatedSection className="about-team">
      <span className="sh__sub" style={{ justifyContent: "center" }}>
        <span className="sh__accent-line" />The Hands Behind the Craft
      </span>
      <motion.h2 variants={fadeUp}>Meet Our Team</motion.h2>
      <motion.div className="about-team-grid" variants={stagger}>
        {[
          { name: "Design Studio", icon: "✨", desc: "Where colors meet creativity and new ideas are born." },
          { name: "Quality & Packaging", icon: "🎀", desc: "Ensuring every order is beautiful, secure, and ready to gift." },
          { name: "Customer Happiness", icon: "💖", desc: "Dedicated to bringing a smile to your face with every purchase." }
        ].map((team) => (
          <TiltCard key={team.name} tiltDegree={4} glare={true} scale={1.01}>
            <motion.div className="about-team-card" variants={fadeUp}>
              <span className="team-icon">{team.icon}</span>
              <h3>{team.name}</h3>
              <p>{team.desc}</p>
            </motion.div>
          </TiltCard>
        ))}
      </motion.div>
    </AnimatedSection>

    {/* ── Stats ── */}
    <AnimatedSection className="about-stats">
      {[
        { number: "100+", label: "Happy Customers" },
        { number: "100%", label: "Handmade" },
        { number: "200+", label: "Unique Designs" },
      ].map((stat, idx) => (
        <TiltCard key={idx} tiltDegree={3} glare={false} scale={1.01}>
          <motion.div className="about-stat" variants={scaleIn}>
            <motion.strong
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
              {stat.number}
            </motion.strong>
            <span>{stat.label}</span>
          </motion.div>
        </TiltCard>
      ))}
    </AnimatedSection>
  </div>
);

export default About;
