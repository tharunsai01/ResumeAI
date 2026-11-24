import { Compass, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink, Card } from '@/components/ui';
import { site } from '@/config/site';
import { useAuth } from '@/context/AuthContext';

function Article({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
      <h1 className="text-h1 font-extrabold text-ink">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-muted">{intro}</p>
      <div className="mt-10 space-y-8 text-[0.9375rem] leading-relaxed text-ink-muted [&_h2]:mb-2 [&_h2]:text-h3 [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{children}</div>
    </article>
  );
}

export function DocsPage() {
  return (
    <Article title="Documentation" intro="How HireSmart AI reads resumes, scores matches and keeps people in charge of decisions.">
      <section>
        <h2>For candidates</h2>
        <ul>
          <li>Upload a PDF or DOCX resume (up to 5 MB) in Resume hub. Each processing stage is shown as it runs.</li>
          <li>Review what was extracted, then copy it into your profile. Edit anything that is wrong.</li>
          <li>Browse jobs to see your match score and the four parts behind it, then apply with one click.</li>
          <li>Skill analysis lists the skills your target jobs ask for that your profile does not show yet.</li>
        </ul>
      </section>
      <section>
        <h2>For recruiters</h2>
        <ul>
          <li>Paste a job description and let the AI suggest required and preferred skills, then edit and publish.</li>
          <li>Run screening to score every applicant with the official formula. Screening only marks applicants as screened.</li>
          <li>Move people through the pipeline, schedule interviews and record feedback. Every change is logged.</li>
        </ul>
      </section>
      <section>
        <h2>The scoring formula</h2>
        <p>Overall = Skills × 0.50 + Experience × 0.20 + Education × 0.10 + Role × 0.20. Strong match is 80 to 100, potential match 60 to 79.99, low match below 60. Weights are fixed and are not editable per job.</p>
      </section>
      <section>
        <h2>For developers</h2>
        <p>The repository includes API, architecture, security and deployment guides in the docs folder.</p>
      </section>
    </Article>
  );
}

export function ContactPage() {
  const { user } = useAuth();
  return (
    <Article title="Contact" intro="Questions about an account, a job post or a match score? Here is the fastest way to reach the team.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <h2>Signed-in users</h2>
          <p className="mt-1">Open a support ticket. You can follow replies and status changes in your account.</p>
          <ButtonLink to={user ? '/support' : '/login'} className="mt-5" variant="secondary">
            {user ? 'Open a ticket' : 'Log in to open a ticket'}
          </ButtonLink>
        </Card>
        <Card className="p-6">
          <h2>Everyone else</h2>
          {site.contactEmail ? (
            <>
              <p className="mt-1">Email the team and we will reply within two working days.</p>
              <a href={`mailto:${site.contactEmail}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                <Mail className="size-4" /> {site.contactEmail}
              </a>
            </>
          ) : (
            <p className="mt-1">This deployment has no public contact address configured. Create a free account to open a support ticket.</p>
          )}
        </Card>
      </div>
    </Article>
  );
}

export function PrivacyPage() {
  return (
    <Article title="Privacy" intro="What HireSmart AI stores, why, and who can see it.">
      <section>
        <h2>What we store</h2>
        <ul>
          <li>Account details: name, email, role and a salted password hash.</li>
          <li>Resumes you upload, the text extracted from them and the analysis report.</li>
          <li>Applications, match results, interview records and support tickets.</li>
          <li>Security events such as sign-ins and administrative actions, kept for up to 365 days.</li>
        </ul>
      </section>
      <section>
        <h2>Who can see your data</h2>
        <ul>
          <li>Recruiters see your profile and resume only for jobs you applied to, or if you opt in to the talent pool.</li>
          <li>Administrators can review flagged documents and audit logs to keep the platform safe.</li>
          <li>The AI service receives document text to analyse it. It does not write to the database.</li>
        </ul>
      </section>
      <section>
        <h2>What scoring ignores</h2>
        <p>Match scores never use names, gender, age, religion, ethnicity, marital status or similar characteristics. The free-text summary of your profile is excluded from scoring.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You can delete resumes at any time, which removes the file and its extracted text. To close your account, open a support ticket.</p>
      </section>
    </Article>
  );
}

export function TermsPage() {
  return (
    <Article title="Terms of use" intro="The short version: use HireSmart AI honestly, and remember that match scores support decisions rather than make them.">
      <section>
        <h2>Accounts</h2>
        <p>Provide accurate information and keep your password private. Accounts that upload manipulative content, such as hidden instructions aimed at AI screeners, may be suspended.</p>
      </section>
      <section>
        <h2>Recruiters</h2>
        <p>Job posts must describe real roles. Hiring decisions are yours: use match scores as one input alongside your own review, and comply with employment law in your jurisdiction.</p>
      </section>
      <section>
        <h2>Scores and AI output</h2>
        <p>Scores are produced by a published formula and can be wrong when a resume is incomplete or unusual. Candidates can update their profile at any time, and every score shows how it was calculated.</p>
      </section>
    </Article>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 pt-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Compass className="size-7" aria-hidden />
      </span>
      <h1 className="mt-6 text-h1 font-extrabold text-ink">Page not found</h1>
      <p className="mt-3 text-ink-muted">The link may be broken or the page may have moved.</p>
      <ButtonLink to="/" className="mt-8">
        Go to the home page
      </ButtonLink>
    </div>
  );
}
