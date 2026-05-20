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
          <Section title="Who we are">
            Plinks.dev is a small, independent link-in-bio service. It is operated by a single individual based in the United States. Contact: <a href="mailto:plinksbiz@proton.me" style={{ color: ACCENT }}>plinksbiz@proton.me</a>.
          </Section>

          <Section title="What we collect">
            <strong>Account info you give us:</strong> your handle, display name, bio, password (stored as a salted hash, never plain text), and any profile content you upload (photos, cover art, audio clips, links, social handles, release info).
            <br /><br />
            <strong>Analytics on profile activity:</strong> we log basic events when someone views a profile — view counts, link clicks, audio plays. Each event includes the artist's handle, the event type, the page referrer (e.g. "instagram.com" if a fan came from Instagram), and an anonymous session ID stored in the visitor's own browser. We do not log IP addresses and we do not use any third-party analytics service.
            <br /><br />
            <strong>Fan submissions to your page:</strong> if a fan submits an email through your drop-alert form or sends you a DM through your fan inbox, we store that submission so you can see it in your Studio. The fan's email is only visible to you (the artist) and to site admins for abuse moderation.
            <br /><br />
            <strong>Billing:</strong> if you upgrade to Premium, payment is processed by Stripe. We never see or store your full card number. Stripe gives us back a customer ID, your subscription status, and the renewal date.
          </Section>

          <Section title="What we do NOT do">
            We do not sell your data. We do not share it with advertisers or data brokers. We do not use your content or fan data to train AI models. We do not run advertising pixels, third-party trackers, or remarketing scripts. We do not show ads on the service.
          </Section>

          <Section title="How we use what we collect">
            To run your profile and the service. To process Premium payments through Stripe. To respond to support emails. To investigate abuse and enforce the Terms.
            <br /><br />
            <strong>About email:</strong> we do not currently operate any automated email system. Fan emails captured by drop alerts sit in your subscribers list for you to export and contact using your own email tool.
          </Section>

          <Section title="Service providers">
            We rely on a small number of third-party processors to run the service:
            <br />
            · <strong>Supabase</strong> — database, file storage, authentication backend (SOC 2 Type II)
            <br />
            · <strong>Vercel</strong> — website hosting (SOC 2 Type II)
            <br />
            · <strong>Stripe</strong> — payment processing (PCI-DSS Level 1)
            <br />
            · <strong>Cloudflare</strong> — DNS / CDN where applicable
            <br /><br />
            Each is contractually obligated to handle data only as needed to provide their service to us.
          </Section>

          <Section title="Cookies & local storage">
            We only use first-party browser storage. Specifically:
            <br />
            · A session token to keep you logged in
            <br />
            · Your cookie consent preference (if you've dismissed the banner)
            <br />
            · An anonymous analytics session ID
            <br />
            · Admin impersonation state (admin accounts only)
            <br /><br />
            No third-party tracking cookies. No advertising cookies. No Google Analytics or similar.
          </Section>

          <Section title="Your rights (GDPR / CCPA / CalOPPA)">
            <strong>Delete your account:</strong> Edit → Danger zone → Delete account. This permanently wipes your profile, uploads, releases, fan messages, drop alerts, and analytics. Cannot be undone. You may also email <a href="mailto:plinksbiz@proton.me" style={{ color: ACCENT }}>plinksbiz@proton.me</a> with your handle to request deletion.
            <br /><br />
            <strong>Correct your info:</strong> edit anything in your profile yourself via the Edit page.
            <br /><br />
            <strong>Access / data copy:</strong> email <a href="mailto:plinksbiz@proton.me" style={{ color: ACCENT }}>plinksbiz@proton.me</a> with your handle. Plinks.dev is operated by one person — we respond within 30 days and send you a copy of the data we hold. There is no automated export tool yet; responses are handled manually.
            <br /><br />
            <strong>Opt out of sale:</strong> we don't sell data, so this is automatic.
            <br /><br />
            <strong>Fan submissions to other profiles:</strong> if you are a fan who submitted an email or message to an artist's page and want it removed, email <a href="mailto:plinksbiz@proton.me" style={{ color: ACCENT }}>plinksbiz@proton.me</a> with the artist's handle and the email/message you submitted.
          </Section>

          <Section title="Data retention">
            We keep your data as long as your account is active. After you delete your account, profile data is removed from our active database within 30 days. Stripe billing records and security logs may be retained for up to 7 years where required by US tax or legal obligations.
          </Section>

          <Section title="Children">
            Plinks.dev is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has signed up, email <a href="mailto:plinksbiz@proton.me" style={{ color: ACCENT }}>plinksbiz@proton.me</a> and we will delete the account.
          </Section>

          <Section title="Security">
            Passwords are stored as salted hashes. All traffic uses HTTPS. The database is encrypted at rest by Supabase. Payments are PCI-DSS compliant through Stripe — we never receive your card number. No system is perfectly secure. If a breach affecting your data ever occurs, we will notify you as required by applicable law.
          </Section>

          <Section title="International users">
            Our servers are in the United States. If you use Plinks.dev from outside the US (including the EU/UK), your data is transferred to and processed in the US. By using the service, you consent to this transfer.
          </Section>

          <Section title="Changes to this policy">
            We may update this policy. Material changes will be announced on the homepage at least 14 days before they take effect.
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
