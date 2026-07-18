import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import TiltCard from "../components/TiltCard";
import "../styles/about.css";
import aboutimg from "../assets/aboutimg.jpg";

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

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

const About = () => (
  <div className="about-page-container">
    <motion.section className="about-hero-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}>
      <motion.div className="about-hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <motion.h1 className="about-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}>
          Our Story
        </motion.h1>
        <motion.p className="about-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}>
          Crafting joy, one piece at a time. Discover the passion behind Sumathi's Crazy Collections.
        </motion.p>
      </motion.div>
    </motion.section>

    <AnimatedSection className="about-mission-section">
      <motion.div className="mission-content" variants={fadeUp}>
        <motion.h2 variants={fadeUp}>Handmade with Love</motion.h2>
        <motion.p variants={fadeUp}>
          We started our journey with a love for handmade accessories and a dream to
          bring affordable, joyful pieces to every wardrobe. Each bracelet and earring
          is crafted with care, combining playful colors and thoughtful charms to make
          your everyday style feel extra special.
        </motion.p>
      </motion.div>
      <motion.div className="mission-image-wrapper" variants={scaleIn}>
        <motion.img src={aboutimg} alt="Artisan crafting jewelry" className="mission-image"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.4 }} />
      </motion.div>
    </AnimatedSection>

    <AnimatedSection className="about-team-section">
      <motion.h2 variants={fadeUp}>The Hands Behind the Craft</motion.h2>
      <motion.div className="about-team-grid" variants={stagger}>
        {[
          { name: "Design Studio", icon: "\u2728", desc: "Where colors meet creativity and new ideas are born." },
          { name: "Quality & Packaging", icon: "🎀", desc: "Ensuring every order is beautiful, secure, and ready to gift." },
          { name: "Customer Happiness", icon: "💖", desc: "Dedicated to bringing a smile to your face with every purchase." }
        ].map((team, i) => (
          <TiltCard key={team.name} tiltDegree={4} glare={true} scale={1.01}>
            <motion.div className="about-team-card" variants={fadeUp}>
              <motion.div className="team-icon"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}>
                {team.icon}
              </motion.div>
              <h3>{team.name}</h3>
              <p>{team.desc}</p>
            </motion.div>
          </TiltCard>
        ))}
      </motion.div>
    </AnimatedSection>

    <AnimatedSection className="about-stats-section">
      {[
        { number: "100+", label: "Happy Customers" },
        { number: "100%", label: "Handmade" },
        { number: "200+", label: "Unique Designs" },
      ].map((stat, i) => (
        <TiltCard key={i} tiltDegree={3} glare={false} scale={1.01}>
          <motion.div className="stat-card" variants={scaleIn}>
            <motion.h4
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
              {stat.number}
            </motion.h4>
            <p>{stat.label}</p>
          </motion.div>
        </TiltCard>
      ))}
    </AnimatedSection>
  </div>
);

export default About;
