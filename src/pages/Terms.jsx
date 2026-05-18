import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav.jsx';

const BG = '#0A0A0A';
const INK = '#F2EFE6';
const MUTED = '#8A8680';
const ACCENT = '#FF4D1F';
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Fraunces", serif';

export default function Terms() {
  return (
    <div style={{ background: BG, color: INK, minHeight: '100vh' }}>
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 pt-24 md:pt-32 pb-20" style={{ fontFamily: DISPLAY }}>
        <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-4" style={{ fontFamily: MONO, color: ACCENT }}>
          PLINKS.DEV
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Terms of Service</h1>
        <div className="text-[10px] tracking-[0.3em] uppercase mb-10" style={{ fontFamily: MONO, color: MUTED }}>
          Last updated: November 2026
        </div>

        <div className="space-y-8 text-base leading-relaxed">
          <Section title="1. The deal">
            plinks.dev (operated by Lucien / HBK Lux Records, "we", "us") provides a link-in-bio hosting service. By creating a profile, uploading content, or paying for premium, you agree to these terms.
            If you don't agree, don't use the service.
          </Section>

          <Section title="2. Your account">
            You must be at least 13 years old to use plinks.dev (or 16 in EU jurisdictions). You're responsible for keeping your password safe. One person or entity per account. You're responsible for everything posted from your account.
          </Section>

          <Section title="3. Content you upload">
            You keep ownership of everything you upload — audio, images, bio text, links. By uploading, you grant plinks.dev a non-exclusive, worldwide, royalty-free license to host, display, and serve that content for the purpose of running your profile. We don't sell your content or use it to train AI.
            <br /><br />
            You promise that everything you upload is yours to share. If you upload copyrighted material you don't own (e.g. someone else's song), your account can be terminated and the rightful owner can issue a DMCA takedown (see Section 9).
          </Section>

          <Section title="4. What you can't do">
            No illegal content. No CSAM, no terrorism, no incitement, no doxxing. No spam or bots. No reselling our service. No reverse-engineering. No scraping. No impersonating other people. No content that violates someone else's IP.
            We reserve the right to remove content and terminate accounts at our discretion if these are violated.
          </Section>

          <Section title="5. Premium subscription & billing">
            Premium plans are billed through Stripe. Pricing is shown on /upgrade before checkout.
            <br /><br />
            <strong>$3 first month:</strong> introductory rate for new subscribers; renews at $7/month after the first month unless you cancel.
            <br />
            <strong>$7/month:</strong> standard monthly rate, billed every 30 days.
            <br />
            <strong>$60/year:</strong> annual rate, billed once per year.
            <br /><br />
            <strong>Cancellation:</strong> You can cancel anytime via the "Manage subscription" button on /upgrade. Cancellation takes effect at the end of the current billing period. No partial refunds for unused time, but you keep premium until the period ends.
            <br /><br />
            <strong>Refunds:</strong> By default, no refunds. If you were charged in error or have a billing dispute, email support@plinks.dev within 14 days.
            <br /><br />
            <strong>Price changes:</strong> We may raise prices on future renewal periods with at least 30 days notice via email.
          </Section>

          <Section title="6. Trademarks">
            "plinks", "plinks.dev", and "Plinks Studio" are our marks. Spotify, Apple Music, YouTube, SoundCloud, Tidal, Amazon Music, Deezer, Bandcamp, Instagram, TikTok, X, Facebook, Twitch, Discord, and other third-party names and logos are trademarks of their respective owners. plinks.dev is not affiliated with, sponsored by, or endorsed by any of them. We reference these brands under nominative fair use so users can identify destination links.
          </Section>

          <Section title="7. Termination">
            You can delete your account anytime via Edit → Delete account, or by emailing support@plinks.dev. We can suspend or terminate your account for violations of these terms.
          </Section>

          <Section title="8. Disclaimers & liability">
            The service is provided "as is" without warranty of any kind. We don't guarantee uptime, that your data won't be lost, or that the service will be free of bugs. To the maximum extent allowed by law, our total liability for any claim is capped at the amount you paid us in the 12 months before the claim, or $50, whichever is greater.
          </Section>

          <Section title="9. DMCA & copyright">
            If you believe content on plinks.dev infringes your copyright, send a notice to dmca@plinks.dev with: (a) your contact info, (b) the URL of the infringing content, (c) a description of the original work, (d) a statement under penalty of perjury that you own the rights, (e) your physical or electronic signature. We comply with the DMCA safe harbor process.
          </Section>

          <Section title="10. Changes">
            We may update these terms. Material changes will be announced via email or in-app notice with at least 14 days notice before they take effect.
          </Section>

          <Section title="11. Law & contact">
            These terms are governed by the laws of the State of Ohio, USA, without regard to conflict of law principles.
            <br /><br />
            Contact: <a href="mailto:support@plinks.dev" style={{ color: ACCENT }}>support@plinks.dev</a>
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
