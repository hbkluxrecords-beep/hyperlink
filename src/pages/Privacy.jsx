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
            <strong>Account info:</strong> your handle, display name, bio, and password hash. We never store your password in plain text.
            <br /><br />
            <strong>Content you upload:</strong> profile photos, cover art, audio previews, links, social handles, release info, portfolio URLs.
            <br /><br />
            <strong>Analytics:</strong> we may store anonymized event counts (profile views, link clicks, audio plays) to show basic stats. No tracking cookies. No third-party ad networks.
            <br /><br />
            <strong>Billing:</strong> if you upgrade to premium, Stripe handles your card info. We never see your full card number. Stripe gives us a customer ID and your subscription status.
            <br /><br />
            <strong>Fan submissions:</strong> when fans send DMs or sign up for drop alerts on your profile, we store their email and message text so you can see them in your inbox/subscribers list.
          </Section>

          <Section title="What we DON'T do">
            We don't sell your data. We don't share it with advertisers. We don't use it to train AI models. We don't run third-party tracking pixels. We don't show ads.
          </Section>

          <Section title="How we use it">
            To run your profile and the service. To process payments via Stripe. To investigate abuse and enforce the Terms.
            <br /><br />
            <strong>Note on email:</strong> we do not currently send automated emails. Fan emails captured via drop alerts are stored in your subscribers list so you can export them and contact fans yourself.
          </Section>

          <Section title="Third parties we use">
            <strong>Supabase</strong> — database and file storage (US).
            <br />
            <strong>Stripe</strong> — payment processing.
            <br />
            <strong>Vercel</strong> — hosting.
            <br /><br />
            Each has its own privacy policy and is contractually bound to handle data securely.
          </Section>

          <Section title="Cookies & local storage">
            We use minimal first-party browser storage only:
            <br />
            · A session token to keep you logged in
            <br />
            · Your cookie consent preference
            <br />
            · Admin impersonation state (admins only)
            <br /><br />
            No third-party tracking cookies. No advertising cookies. No analytics scripts.
          </Section>

          <Section title="Your rights (GDPR / CCPA / CalOPPA)">
            <strong>Right to delete:</strong> use Edit → Danger zone → Delete account. This permanently wipes your profile and associated data. You can also email plinksbiz@proton.me to request deletion.
            <br /><br />
            <strong>Right to correct:</strong> edit anything in your profile yourself via the Edit page.
            <br /><br />
            <strong>Right to access / portability:</strong> email plinksbiz@proton.me with your handle and we'll send you a copy of your account data within 30 days. We are a small operation and handle these requests manually.
            <br /><br />
            <strong>Right to opt out of sale:</strong> we don't sell data, so this is automatic.
            <br /><br />
            For any data request, email <a href="mailto:plinksbiz@proton.me" style={{ color: ACCENT }}>plinksbiz@proton.me</a>. We respond within 30 days.
          </Section>

          <Section title="Data retention">
            We keep your data as long as your account is active. If you delete your account, we wipe your profile data within 30 days. We may retain certain billing/transaction records for up to 7 years for legal/tax purposes.
          </Section>

          <Section title="Children">
            plinks.dev is not directed at children under 13. We don't knowingly collect data from children under 13. EU users must be at least 16. If you believe we have data from a child, email plinksbiz@proton.me and we'll delete it.
          </Section>

          <Section title="Security">
            Passwords are hashed (not stored in plain text). Payments are PCI-DSS compliant via Stripe. All data is transmitted over HTTPS. Supabase provides industry-standard encryption at rest. No system is 100% secure — if there's ever a breach affecting your data, we'll notify you as required by applicable law.
          </Section>

          <Section title="International users">
            Our servers are in the United States. If you're using the service from outside the US (including the EU/UK), your data is transferred to and processed in the US. By using the service, you consent to this transfer.
          </Section>

          <Section title="Changes">
            We may update this policy. Material changes will be announced via in-app notice or on the homepage with at least 14 days notice before taking effect.
          </Section>

          <Section title="Contact">
            <a href="mailto:plinksbiz@proton.me" style={{ color: ACCENT }}>plinksbiz@proton.me</a>
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
