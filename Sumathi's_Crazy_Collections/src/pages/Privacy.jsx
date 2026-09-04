import { motion } from "framer-motion";
import "../styles/policies.css";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

const GRIEVANCE_EMAIL = "sumathiscrazycollection@gmail.com";
const LAST_UPDATED = "4 September 2026";

const Privacy = () => (
  <section className="policy-page">
    <div className="policy-header">
      <span className="sh__sub"><span className="sh__accent-line" />Your Trust Matters</span>
      <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        Privacy Policy
      </motion.h2>
      <p>Last updated: {LAST_UPDATED}. We comply with the Digital Personal Data Protection Act, 2023 (DPDP Act).</p>
    </div>

    {[
      {
        title: "1. Overview & Data Fiduciary",
        body: (
          <>
            <p>
              Sumathi's Crazy Collections ("we", "us", "our") is the <strong>Data Fiduciary</strong> for the personal data
              we process. This policy explains how we collect, use, store and protect your digital personal data, and how you
              can exercise the rights granted to you (the <strong>Data Principal</strong>) under the Digital Personal Data
              Protection Act, 2023 of India.
            </p>
            <p>
              By creating an account or placing an order, you provide your consent to the processing described in this policy.
              We only process personal data for lawful purposes, with your consent, and never sell your information to third parties.
            </p>
          </>
        ),
      },
      {
        title: "2. What We Collect (with Your Consent)",
        body: (
          <>
            <ul>
              <li><strong>Identity & contact details:</strong> your name, email address, phone number and shipping address — collected at signup / checkout to fulfil orders.</li>
              <li><strong>Order history:</strong> records of products purchased, amounts and order status, kept for fulfilment and legal/tax compliance.</li>
              <li><strong>Communications:</strong> messages you send us through the contact page or custom-order form.</li>
              <li><strong>Account preferences:</strong> saved addresses, wishlist, reviews and return requests.</li>
              <li><strong>Analytics (only if you accept the cookie banner):</strong> anonymised usage data via Vercel Analytics to improve our storefront. No analytics run until you explicitly accept.</li>
            </ul>
          </>
        ),
      },
      {
        title: "3. How We Use Your Data (Purpose Limitation)",
        body: (
          <>
            <ul>
              <li>Processing and delivering your orders, including payment confirmation, dispatch and delivery updates.</li>
              <li>Providing customer support and responding to inquiries.</li>
              <li>Managing your account, addresses, wishlist and reviews.</li>
              <li>Complying with legal, tax and regulatory obligations (e.g. retaining order records).</li>
              <li>Improving our website through anonymised analytics — only with your consent.</li>
            </ul>
            <p><strong>Purpose limitation:</strong> If you share your phone number, it is used only for delivery updates and
              support — never for marketing, and never sold to third-party advertisers.</p>
            <p><strong>Marketing:</strong> We do not run marketing campaigns. If we ever do, we will contact you only after
              obtaining a separate, explicit opt-in — your order/transactional data will never be used for marketing by
              default.</p>
            <p>We do not use your data for behavioural monitoring, targeted advertising to children, or any purpose incompatible with those above.</p>
          </>
        ),
      },
      {
        title: "4. Consent — Clear, Specific, Informed & Unambiguous",
        body: (
          <>
            <p>
              In line with the DPDP Act, we obtain your <strong>explicit consent</strong> before processing your personal data.
              When you sign up you must tick the consent box (and confirm your age), and this consent record — including the
              date and version of this policy — is stored in your account metadata for auditability.
            </p>
            <p>
              You may <strong>withdraw your consent at any time</strong> by:
            </p>
            <ul>
              <li>Deleting your account from <a href="/delete-account" style={{ color: "#B8953A", fontWeight: 600 }}>Delete Account</a> (erases your personal data), or</li>
              <li>Contacting our Grievance Officer (see Section 10).</li>
            </ul>
          </>
        ),
      },
      {
        title: "5. Children's Data",
        body: (
          <>
            <p>
              Our products are not directed at children. To comply with the DPDP Act:
            </p>
            <ul>
              <li>You must confirm at signup that you are <strong>18 years or older</strong>, or that you have <strong>verifiable parental consent</strong> from a parent or legal guardian.</li>
              <li>We do not undertake behavioural monitoring or targeted advertising directed at children.</li>
              <li>We do not knowingly collect personal data of children without verifiable parental consent.</li>
            </ul>
            <p>
              If you believe a child's data has been collected without parental consent, contact us immediately (Section 10) and we will delete it without undue delay.
            </p>
          </>
        ),
      },
      {
        title: "6. Your Rights as a Data Principal",
        body: (
          <>
            <ul>
              <li><strong>Right to access:</strong> request a copy of the personal data we hold about you — email our Grievance Officer (Section 10).</li>
              <li><strong>Right to correction:</strong> update your name/phone anytime in <a href="/profile" style={{ color: "#B8953A", fontWeight: 600 }}>Account Settings</a>.</li>
              <li><strong>Right to erasure:</strong> delete your account and all personal data from <a href="/delete-account" style={{ color: "#B8953A", fontWeight: 600 }}>Delete Account</a>. Order records are retained for 3 years as required by law.</li>
              <li><strong>Right to portability:</strong> request your data in a structured, machine-readable format.</li>
              <li><strong>Right to grievance redressal:</strong> raise a grievance with our Grievance Officer — resolved within 30 days.</li>
            </ul>
          </>
        ),
      },
      {
        title: "7. Data Retention — Deletion When No Longer Needed",
        body: (
          <>
            <p>
              As required by the DPDP Act, we delete personal data when it is no longer needed for the purpose for which it was
              processed. Deleting your account removes your profile, addresses, cart, wishlist, reviews and return requests.
              Order history is kept for <strong>3 years</strong> to meet legal and tax obligations, after which it is deleted or anonymised.
            </p>
          </>
        ),
      },
      {
        title: "8. Security Safeguards",
        body: (
          <>
            <ul>
              <li>All data is transmitted over encrypted connections (HTTPS).</li>
              <li>Row Level Security on our database ensures users can only see and edit their own data.</li>
              <li>Account deletion and role changes run through server-side, rate-limited edge functions — never from the client.</li>
              <li>Passwords are hashed and managed by our authentication provider; we never store or see your password.</li>
              <li>We never sell or rent your personal data to third parties.</li>
            </ul>
          </>
        ),
      },
      {
        title: "9. Breach Notification",
        body: (
          <>
            <p>
              In the event of a personal data breach that is likely to cause harm to you, we will notify the
              <strong> Data Protection Board of India</strong> and affected Data Principals in accordance with the DPDP Act,
              and take reasonable steps to mitigate harm.
            </p>
          </>
        ),
      },
      {
        title: "10. Grievance Redressal — Contact Our Grievance Officer",
        body: (
          <>
            <p>
              If you have any questions, requests or complaints about your personal data, please contact our Grievance Officer:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href={`mailto:${GRIEVANCE_EMAIL}`} style={{ color: "#B8953A", fontWeight: 600 }}>{GRIEVANCE_EMAIL}</a></li>
              <li><strong>Via:</strong> our <a href="/contact" style={{ color: "#B8953A", fontWeight: 600 }}>Contact page</a></li>
            </ul>
            <p>We will acknowledge your grievance promptly and resolve it within <strong>30 days</strong> of receipt.</p>
          </>
        ),
      },
      {
        title: "11. Complaints to the Data Protection Board of India",
        body: (
          <>
            <p>
              If you are not satisfied with our response, you have the right to file a complaint with the
              <strong> Data Protection Board of India</strong> — the enforcement authority under the DPDP Act — as prescribed
              by the Act and its rules.
            </p>
          </>
        ),
      },
      {
        title: "12. Changes to This Policy",
        body: (
          <>
            <p>
              We may update this policy from time to time. The latest version will always be available on this page with the
              "Last updated" date shown above. Material changes that require fresh consent will be brought to your attention.
            </p>
          </>
        ),
      },
    ].map((item) => (
      <motion.div key={item.title} className="policy-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h3>{item.title}</h3>
        {item.body}
      </motion.div>
    ))}
  </section>
);

export default Privacy;