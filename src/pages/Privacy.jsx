import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav.jsx';

const BG = '#0A0A0A';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

export default function Privacy() {
  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32 pb-20" style={{ fontFamily: DISPLAY }}>
        <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4" style={{ fontFamily: MONO, color: ACCENT }}>
          PLINKS.DEV
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Privacy Policy</h1>
        <div className="text-[10px] tracking-[0.3em] uppercase mb-10" style={{ fontFamily: MONO, color: MUTED }}>
          Last updated: November 2026
        </div>

        <div className="space-y-8 text-base leading-relaxed">
          <Section title="What we collect">
            <strong>Account info:</strong> your handle, display name, bio, email (if you sign up for premium or drop alerts), and password hash. We never store your password in plain text.
            <br /><br />
            <strong>Content you upload:</strong> profile photos, cover art, audio previews, links, social handles, release info.
            <br /><br />
            <strong>Analytics:</strong> anonymized event counts — profile views, link clicks, audio plays, share clicks. No tracking cookies. No third-party ad networks.
            <br /><br />
            <strong>Billing:</strong> if you upgrade to premium, Stripe handles your card info. We never see your full card number. Stripe gives us a customer ID and subscription status.
            <br /><br />
            <strong>Fan submissions:</strong> when fans send DMs or sign up for drop alerts on your profile, we store their email and message text so you can see them in your inbox/subscribers list.
          </Section>

          <Section title="What we DON'T do">
            We don't sell your data. We don't share it with advertisers. We don't use it to train AI models. We don't run third-party tracking pixels. We don't show ads. Anthropic doesn't display ads in Claude products either — same vibe.
          </Section>

          <Section title="How we use it">
            To run your profile and the service. To process payments. To send transactional emails (receipts, password resets). If you opt in, to send drop alerts and product updates. To investigate abuse and enforce the Terms.
          </Section>

          <Section title="Third parties we use">
            <strong>Supabase</strong> — database and file storage (servers in the US).
            <br />
            <strong>Stripe</strong> — payment processing.
            <br />
            <strong>Vercel</strong> — hosting.
            <br /><br />
            That's it. Each of these has its own privacy policy and is contractually bound to handle data securely.
          </Section>

          <Section title="Cookies">
            We use minimal first-party storage:
            <br />
            · A session token to keep you logged in
            <br />
            · A preference for your selected layout/theme
            <br /><br />
            No third-party tracking cookies. No advertising cookies. No analytics scripts beyond our own first-party event counter.
          </Section>

          <Section title="Your rights (GDPR / CCPA / CalOPPA)">
            <strong>Right to access:</strong> request a copy of your data.
            <br />
            <strong>Right to delete:</strong> use Edit → Delete account, or email privacy@plinks.dev.
            <br />
            <strong>Right to correct:</strong> edit anything in your profile yourself, or email us.
            <br />
            <strong>Right to portability:</strong> request your data in JSON form.
            <br />
            <strong>Right to opt out of sale:</strong> we don't sell data, so this is automatic.
            <br /><br />
            For any of these, email <a href="mailto:privacy@plinks.dev" style={{ color: ACCENT }}>privacy@plinks.dev</a>. We respond within 30 days.
          </Section>

          <Section title="Data retention">
            We keep your data as long as your account is active. If you delete your account, we wipe your profile data within 30 days. We may retain certain billing/transaction records for 7 years for legal/tax purposes (US tax law requirement).
          </Section>

          <Section title="Children">
            plinks.dev is not directed at children under 13. We don't knowingly collect data from children under 13. EU users must be at least 16. If you believe we have data from a child, email privacy@plinks.dev and we'll delete it.
          </Section>

          <Section title="Security">
            Passwords are hashed (not stored in plain text). Payments are PCI-DSS compliant via Stripe. All data is transmitted over HTTPS. We use industry-standard encryption at rest via Supabase. No system is 100% secure — if there's ever a breach, we'll notify affected users within 72 hours as required by law.
          </Section>

          <Section title="International users">
            Our servers are in the United States. If you're using the service from outside the US (including the EU/UK), your data is transferred to and processed in the US. By using the service, you consent to this transfer.
          </Section>

          <Section title="Changes">
            We may update this policy. Material changes will be announced via email or in-app notice at least 14 days before they take effect.
          </Section>

          <Section title="Contact">
            <a href="mailto:privacy@plinks.dev" style={{ color: ACCENT }}>privacy@plinks.dev</a>
          </Section>
        </div>

        <div className="mt-12 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Link to="/" className="text-[10px] tracking-[0.3em] uppercase font-bold hover:opacity-70" style={{ fontFamily: MONO, color: ACCENT }}>
            ← Back to plinks.dev
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-3">{title}</h2>
      <div style={{ color: '#D5D2C7' }}>{children}</div>
    </div>
  );
}
