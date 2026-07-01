'use client';

import { InputHTMLAttributes, ReactNode, useMemo } from 'react';

import Link from 'next/link';

import { ArrowRight, Code, LockKeyhole, Mail, UserRound } from 'lucide-react';

import { FieldError, SubmitHandler, useForm, UseFormRegisterReturn } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Logo } from './brand';
import { apiCall } from '@/hooks/api-call-hook';
import { useAlert } from './alert';
import { setCookies } from '@/libs/auth-session';
import { useRouter } from 'next/navigation';
import type { AuthResponse } from '@/libs/types';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthPageProps {
	mode: AuthMode;
	resetToken?: string;
	referralCode?: string;
}

const createAuthSchema = (mode: AuthMode, hasResetToken: boolean) => {
	return z
		.object({
			name: z.string().optional(),

			email: z.string().optional(),

			password: z.string().optional(),

			confirmPassword: z.string().optional(),
			referralCode: z.string().optional(),
		})
		.superRefine((data, context) => {
			if (!hasResetToken) {
				if (!data.email) {
					context.addIssue({ code: 'custom', path: ['email'], message: 'Email address is required' });
				} else if (!z.string().email().safeParse(data.email).success) {
					context.addIssue({ code: 'custom', path: ['email'], message: 'Please enter a valid email address' });
				}
			}

			if (mode === 'signup') {
				if (!data.name?.trim()) {
					context.addIssue({ code: 'custom', path: ['name'], message: 'Full name is required' });
				} else if (data.name.trim().length < 3) {
					context.addIssue({ code: 'custom', path: ['name'], message: 'Name must contain at least 3 characters' });
				}
			}

			if (mode !== 'reset' || hasResetToken) {
				if (!data.password) {
					context.addIssue({ code: 'custom', path: ['password'], message: 'Password is required' });
				} else if (data.password.length < 8) {
					context.addIssue({ code: 'custom', path: ['password'], message: 'Password must contain at least 8 characters' });
				}
			}

			if (mode === 'signup') {
				if (!data.confirmPassword) {
					context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Confirm password is required' });
				} else if (data.password !== data.confirmPassword) {
					context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' });
				}
			}

			if (mode === 'reset' && hasResetToken && data.password !== data.confirmPassword) {
				context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' });
			}
		});
};

type AuthFormValues = z.infer<ReturnType<typeof createAuthSchema>>;

const getPageContent = (mode: AuthMode, hasResetToken: boolean) => {
	if (mode === 'signup') {
		return { title: 'Create Account', description: 'Create account and start your 21-day reward journey.', buttonText: 'Create Account' };
	}

	if (mode === 'reset') {
		return hasResetToken
			? { title: 'Choose New Password', description: 'Set a secure password for your account.', buttonText: 'Update Password' }
			: { title: 'Reset Password', description: 'Enter your email to get a reset link.', buttonText: 'Send Reset Link' };
	}

	return { title: 'Welcome Back', description: 'Login to manage your rewards and account.', buttonText: 'Login Account' };
};

export function AuthPage({ mode, resetToken, referralCode }: AuthPageProps) {
	const isSignup = mode === 'signup';
	const isReset = mode === 'reset';
	const { success, error } = useAlert();
	const router = useRouter();
	const hasResetToken = Boolean(resetToken);
	const schema = useMemo(() => createAuthSchema(mode, hasResetToken), [mode, hasResetToken]);

	const pageContent = getPageContent(mode, hasResetToken);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<AuthFormValues>({
		resolver: zodResolver(schema),

		defaultValues: { name: '', email: '', password: '', confirmPassword: '' ,referralCode :''},

		mode: 'onTouched',
	});

	const onSubmit: SubmitHandler<AuthFormValues> = async (formData) => {
		try {
			let submitData: AuthResponse;

			if (isSignup) {
				// submitData = { name: formData.name?.trim(), email: formData.email.trim().toLowerCase(), password: formData.password, confirmPassword: formData.confirmPassword };
				submitData = await apiCall<AuthResponse>('POST', '/auth/register', {
					name: formData.name?.trim(),
					email: formData.email?.trim().toLowerCase(),
					password: formData.password,
					...(referralCode && { referralCode }),
				});
			} else if (isReset && hasResetToken) {
				submitData = await apiCall<AuthResponse>('POST', '/auth/reset-password', { token: resetToken, password: formData.password });
			} else if (isReset) {
				submitData = await apiCall<AuthResponse>('POST', '/auth/forgot-password', { email: formData.email?.trim().toLowerCase() });
			} else {
				submitData = await apiCall<AuthResponse>('POST', '/auth/login', { email: formData.email?.trim().toLowerCase(), password: formData.password });
			}

			if (submitData.success) {
				if (isReset) {
					success(submitData.message);
					if (hasResetToken) {
						router.push('/login');
					} else if (submitData.data?.resetUrl) {
						const resetUrl = new URL(submitData.data.resetUrl);
						router.push(`${resetUrl.pathname}${resetUrl.search}`);
					}
					return;
				}

				if (!submitData.accessToken || !submitData.user) {
					error('Authentication response is incomplete.');
					return;
				}

				await setCookies(submitData.accessToken);
				router.push(submitData.user.type === 'user' ? '/dashboard' : '/admin');
				success(submitData.message);
			} else {
				error(submitData.message);
			}
		} catch (caughtError) {
			const message = caughtError instanceof Error ? caughtError.message : 'Unable to complete authentication.';
			error(message);
		}
	};

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#2563eb,transparent_32%),radial-gradient(circle_at_bottom_right,#7c3aed,transparent_34%),linear-gradient(135deg,#020617,#0f172a_50%,#1e1b4b)] px-4 py-8 text-white">
			<div className="safe-area grid min-h-[calc(100vh-64px)] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
				<section className="hidden lg:block">
					<Link
						href="/"
						className="mb-10 inline-flex rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black backdrop-blur"
					>
						← Back to Home
					</Link>

					<div className="inline-flex rounded-full bg-white/10 px-5 py-3 text-sm font-black">✨ Secure Reward Account</div>

					<h1 className="mt-7 max-w-2xl text-6xl font-black leading-[1.05] tracking-tight">Manage spins, rewards, balances and withdrawals securely.</h1>

					<p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">SpinGold premium account system for membership rewards, referrals and activity tracking.</p>
				</section>

				<section className="mx-auto w-full max-w-xl">
					<div className="mb-8 flex justify-center lg:hidden">
						<Logo light />
					</div>

					<div className="rounded-[2.4rem] border border-white/25 bg-white/90 p-2 shadow-[0_40px_140px_rgba(0,0,0,.45)] backdrop-blur-2xl">
						<div className="rounded-[2rem] bg-white p-6 text-slate-950 sm:p-8">
							<Logo />

							<h2 className="mt-8 text-3xl font-black">{pageContent.title}</h2>
							<p className="mt-2 text-sm text-slate-500">{pageContent.description}</p>
							<form
								className="mt-7 space-y-5"
								onSubmit={handleSubmit(onSubmit)}
								noValidate
							>
								{isSignup && (
									<FormInput
										label="Full Name"
										icon={<UserRound size={18} />}
										placeholder="Your name"
										autoComplete="name"
										registration={register('name')}
										error={errors.name}
									/>
								)}

								{!hasResetToken && (
									<FormInput
										label="Email Address"
										icon={<Mail size={18} />}
										type="email"
										placeholder="Enter email"
										autoComplete="email"
										registration={register('email')}
										error={errors.email}
									/>
								)}

								{(!isReset || hasResetToken) && (
									<FormInput
										label="Password"
										icon={<LockKeyhole size={18} />}
										type="password"
										placeholder="Enter password"
										autoComplete={isSignup ? 'new-password' : 'current-password'}
										registration={register('password')}
										error={errors.password}
									/>
								)}

								{isReset && hasResetToken && (
									<FormInput
										label="Confirm Password"
										icon={<LockKeyhole size={18} />}
										type="password"
										placeholder="Confirm password"
										autoComplete="new-password"
										registration={register('confirmPassword')}
										error={errors.confirmPassword}
									/>
								)}

								{isSignup && (
									<FormInput
										label="Confirm Password"
										icon={<LockKeyhole size={18} />}
										type="password"
										placeholder="Confirm password"
										autoComplete="new-password"
										registration={register('confirmPassword')}
										error={errors.confirmPassword}
									/>
								)}
								{isSignup && (
									<FormInput
										label="Referral Code"
										icon={<Code size={18} />}
										placeholder="Referral Code"
										registration={register('referralCode')}
										error={errors.referralCode}
									/>
								)}
								<button
									type="submit"
									disabled={isSubmitting}
									className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{pageContent.buttonText}
									<ArrowRight size={18} />
								</button>
							</form>

							<div className="mt-7 text-center text-sm font-bold text-slate-500">
								{isSignup ? 'Already have an account? ' : isReset ? 'Remember password? ' : 'New user? '}

								<Link
									className="font-black text-blue-600"
									href={isSignup || isReset ? '/login' : '/signup'}
								>
									{isSignup || isReset ? 'Login' : 'Create Account'}
								</Link>
							</div>

							{!isReset && (
								<div className="mt-3 text-center">
									<Link
										className="text-sm font-black text-blue-600"
										href="/reset-password"
									>
										Forgot Password?
									</Link>
								</div>
							)}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
	label: string;
	icon: ReactNode;
	registration: UseFormRegisterReturn;
	error?: FieldError;
}

function FormInput({ label, icon, registration, error, ...inputProps }: FormInputProps) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-black text-slate-700">{label}</span>

			<div
				className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition focus-within:ring-4 ${
					error ? 'border-red-400 bg-red-50 focus-within:ring-red-100' : 'border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:ring-blue-100'
				}`}
			>
				<span className={error ? 'text-red-400' : 'text-slate-400'}>{icon}</span>

				<input
					{...inputProps}
					{...registration}
					aria-invalid={Boolean(error)}
					className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
				/>
			</div>

			{error?.message && <span className="mt-2 block text-xs font-bold text-red-500">{error.message}</span>}
		</label>
	);
}
