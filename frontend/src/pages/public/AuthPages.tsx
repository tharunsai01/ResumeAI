import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Briefcase, Building2, Lock, Mail, User as UserIcon, UserRoundSearch } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { SocialIcons } from '@/components/layout/Brand';
import { Button, Input, Tooltip } from '@/components/ui';
import { duration, ease, fadeUp, staggerChildren } from '@/config/motion';
import { homeFor, useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks';
import { toApiError } from '@/services/api';
import { authApi } from '@/services/endpoints';
import { cn } from '@/utils/format';

function FormError({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} role="alert" className="overflow-hidden">
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OAuthButtons({ role }: { role: 'candidate' | 'recruiter' }) {
  const { data } = useAsync(() => authApi.providers(), []);
  const buttons = [
    {
      key: 'google' as const,
      label: 'Google',
      icon: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.01-3.1z" />
          <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
        </svg>
      ),
    },
    { key: 'linkedin' as const, label: 'LinkedIn', icon: <span className="text-[#0A66C2]">{SocialIcons.linkedin}</span> },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {buttons.map((b) => {
        const enabled = !!data?.[b.key];
        const btn = (
          <Button
            variant="secondary"
            className="w-full"
            icon={b.icon}
            disabled={!enabled}
            aria-label={enabled ? `Continue with ${b.label}` : `${b.label} sign-in is not configured on this server`}
            onClick={() => {
              window.location.href = authApi.oauthUrl(b.key, role);
            }}
          >
            {b.label}
          </Button>
        );
        return enabled ? (
          <div key={b.key}>{btn}</div>
        ) : (
          <Tooltip key={b.key} content={`${b.label} sign-in is not configured on this server`}>
            <div className="w-full">{btn}</div>
          </Tooltip>
        );
      })}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-caption text-ink-faint">
      <span className="h-px flex-1 bg-line" />
      or use your email
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

// --- Login ----------------------------------------------------------------------------------
const loginSchema = z.object({ email: z.email('Enter a valid email address'), password: z.string().min(1, 'Enter your password') });
type LoginValues = z.infer<typeof loginSchema>;

const OAUTH_ERRORS: Record<string, string> = {
  provider_unavailable: 'That sign-in provider is not available right now.',
  invalid_state: 'The sign-in link expired. Please try again.',
  state_mismatch: 'The sign-in could not be verified. Please try again.',
  email_not_verified: 'Your provider has not verified this email address, so we could not link it.',
  account_suspended: 'This account has been suspended. Contact support.',
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(params.get('oauth_error') ? (OAUTH_ERRORS[params.get('oauth_error')!] ?? 'Social sign-in failed. Please try again.') : null);
  const { register, handleSubmit, formState } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const from = (location.state as { from?: string } | null)?.from;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const user = await login(values.email, values.password);
      navigate(from && from.startsWith(homeFor(user.role)) ? from : homeFor(user.role), { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    }
  });

  return (
    <motion.div variants={staggerChildren(0.06)} initial="hidden" animate="show">
      <motion.h1 variants={fadeUp} className="text-h2 font-extrabold text-ink">
        Welcome back
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-2 text-[0.9375rem] text-ink-muted">
        Log in to see your matches, applicants or platform activity.
      </motion.p>
      <motion.div variants={fadeUp} className="mt-8">
        <OAuthButtons role="candidate" />
        <Divider />
        <FormError message={error} />
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Input label="Email" type="email" autoComplete="email" leading={<Mail className="size-4" />} error={formState.errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" autoComplete="current-password" leading={<Lock className="size-4" />} error={formState.errors.password?.message} {...register('password')} />
          <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting} loadingText="Logging in">
            Log in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          New to HireSmart AI?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

// --- Register ----------------------------------------------------------------------------------
const registerSchema = z
  .object({
    role: z.enum(['candidate', 'recruiter']),
    name: z.string().trim().min(2, 'Enter your full name').max(80),
    email: z.email('Enter a valid email address'),
    company: z.string().trim().max(120).optional(),
    password: z.string().min(8, 'Use at least 8 characters').regex(/[a-z]/, 'Add a lowercase letter').regex(/[A-Z]/, 'Add an uppercase letter').regex(/\d/, 'Add a number'),
    terms: z.literal(true, { error: 'Accept the terms to continue' }),
  })
  .refine((v) => v.role !== 'recruiter' || (v.company && v.company.length >= 2), { path: ['company'], message: 'Enter your company name' });
type RegisterValues = z.infer<typeof registerSchema>;

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const tones = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-warning', 'bg-success', 'bg-success'];
  return { score, label: labels[score], tone: tones[score] };
}

export function RegisterPage() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'candidate', terms: undefined as unknown as true },
  });
  const role = watch('role');
  const pw = watch('password') ?? '';
  const strength = useMemo(() => passwordStrength(pw), [pw]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const user = await signUp({ name: values.name, email: values.email, password: values.password, role: values.role, company: values.role === 'recruiter' ? values.company : undefined });
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    }
  });

  const roles = [
    { value: 'candidate' as const, title: "I'm looking for work", body: 'Upload a resume, get matched', icon: UserRoundSearch },
    { value: 'recruiter' as const, title: "I'm hiring", body: 'Post jobs, screen applicants', icon: Briefcase },
  ];

  return (
    <motion.div variants={staggerChildren(0.06)} initial="hidden" animate="show">
      <motion.h1 variants={fadeUp} className="text-h2 font-extrabold text-ink">
        Create your account
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-2 text-[0.9375rem] text-ink-muted">
        Free for candidates and recruiters.
      </motion.p>
      <motion.div variants={fadeUp} className="mt-7">
        <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-3">
          {roles.map((r) => {
            const active = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setValue('role', r.value, { shouldValidate: false })}
                className={cn('relative rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-200', active ? 'border-primary bg-primary-soft shadow-[0_0_0_3px_var(--primary-soft)]' : 'border-line-strong hover:border-ink-faint')}
              >
                <r.icon className={cn('size-5', active ? 'text-primary' : 'text-ink-muted')} aria-hidden />
                <p className="mt-3 text-sm font-bold text-ink">{r.title}</p>
                <p className="mt-0.5 text-caption text-ink-muted">{r.body}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <OAuthButtons role={role} />
        </div>
        <Divider />
        <FormError message={error} />
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Input label="Full name" autoComplete="name" leading={<UserIcon className="size-4" />} error={formState.errors.name?.message} {...register('name')} />
          <Input label="Work email" type="email" autoComplete="email" leading={<Mail className="size-4" />} error={formState.errors.email?.message} {...register('email')} />
          <AnimatePresence initial={false}>
            {role === 'recruiter' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', transition: { duration: duration.base, ease: ease.out } }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <Input label="Company" autoComplete="organization" leading={<Building2 className="size-4" />} error={formState.errors.company?.message} {...register('company')} />
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <Input label="Password" type="password" autoComplete="new-password" leading={<Lock className="size-4" />} error={formState.errors.password?.message} hint="8+ characters with upper and lower case letters and a number" {...register('password')} />
            {pw && (
              <div className="mt-2 flex items-center gap-3" aria-live="polite">
                <div className="grid flex-1 grid-cols-5 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={cn('h-1 rounded-full transition-colors duration-300', i < strength.score ? strength.tone : 'bg-elevated')} />
                  ))}
                </div>
                <span className="w-20 text-right text-caption font-semibold text-ink-muted">{strength.label}</span>
              </div>
            )}
          </div>
          <label className="flex items-start gap-2.5 text-sm text-ink-muted">
            <input type="checkbox" className="mt-0.5 size-4 rounded accent-[var(--primary)]" {...register('terms')} aria-invalid={!!formState.errors.terms} />
            <span>
              I agree to the{' '}
              <Link to="/terms" className="font-semibold text-primary hover:underline">
                terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-semibold text-primary hover:underline">
                privacy policy
              </Link>
              .
            </span>
          </label>
          {formState.errors.terms && <p className="-mt-2 text-caption font-medium text-danger">{formState.errors.terms.message}</p>}
          <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting} loadingText="Creating account">
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

// --- OAuth return ---------------------------------------------------------------------------
export function OAuthCallbackPage() {
  const { completeOAuth } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    completeOAuth().then((u) => navigate(u ? homeFor(u.role) : '/login?oauth_error=session', { replace: true }));
  }, [completeOAuth, navigate]);
  return (
    <div className="text-center" role="status">
      <div className="mx-auto size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-sm font-semibold text-ink">Finishing sign-in</p>
    </div>
  );
}
