'use client';

import { AlertTriangle, Check, Info, X, XCircle } from 'lucide-react';

import { CSSProperties, ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface TopAlertProps {
	show: boolean;
	type?: AlertType;
	title?: string;
	message: string;
	duration?: number;
	onClose: () => void;
}

interface AlertDesign {
	defaultTitle: string;
	icon: ReactNode;
	iconStyle: string;
	accent: string;
	progress: string;
}

const alertDesigns: Record<AlertType, AlertDesign> = {
	success: {
		defaultTitle: 'Success',
		icon: (
			<Check
				size={16}
				strokeWidth={3}
			/>
		),
		iconStyle: 'bg-emerald-400/15 text-emerald-400 ring-emerald-400/20',
		accent: 'bg-emerald-400',
		progress: 'bg-emerald-400',
	},

	error: {
		defaultTitle: 'Something went wrong',
		icon: (
			<XCircle
				size={17}
				strokeWidth={2.5}
			/>
		),
		iconStyle: 'bg-rose-400/15 text-rose-400 ring-rose-400/20',
		accent: 'bg-rose-400',
		progress: 'bg-rose-400',
	},

	warning: {
		defaultTitle: 'Warning',
		icon: (
			<AlertTriangle
				size={17}
				strokeWidth={2.5}
			/>
		),
		iconStyle: 'bg-amber-400/15 text-amber-400 ring-amber-400/20',
		accent: 'bg-amber-400',
		progress: 'bg-amber-400',
	},

	info: {
		defaultTitle: 'Information',
		icon: (
			<Info
				size={17}
				strokeWidth={2.5}
			/>
		),
		iconStyle: 'bg-blue-400/15 text-blue-400 ring-blue-400/20',
		accent: 'bg-blue-400',
		progress: 'bg-blue-400',
	},
};

export function TopAlert({ show, type = 'success', title, message, duration = 3500, onClose }: TopAlertProps) {
	const [mounted, setMounted] = useState(show);
	const [visible, setVisible] = useState(false);

	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const onCloseRef = useRef(onClose);

	const design = alertDesigns[type];

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
		}

		if (unmountTimerRef.current) {
			clearTimeout(unmountTimerRef.current);
		}

		if (show) {
			setMounted(true);
			setVisible(false);

			const firstFrame = requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setVisible(true);
				});
			});

			if (duration > 0) {
				closeTimerRef.current = setTimeout(() => {
					onCloseRef.current();
				}, duration);
			}

			return () => {
				cancelAnimationFrame(firstFrame);

				if (closeTimerRef.current) {
					clearTimeout(closeTimerRef.current);
				}
			};
		}

		setVisible(false);

		unmountTimerRef.current = setTimeout(() => {
			setMounted(false);
		}, 300);

		return () => {
			if (unmountTimerRef.current) {
				clearTimeout(unmountTimerRef.current);
			}
		};
	}, [show, duration, message, type]);

	const handleClose = () => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
		}

		onCloseRef.current();
	};

	if (!mounted) {
		return null;
	}

	const progressStyle: CSSProperties = { animationDuration: `${duration}ms` };

	return (
		<div
			className={`pointer-events-none fixed left-1/2 top-4 z-[9999] w-[calc(100%-24px)] max-w-[390px] -translate-x-1/2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
				visible ? 'translate-y-0 scale-100 opacity-100 blur-0' : '-translate-y-5 scale-[0.97] opacity-0 blur-sm'
			}`}
		>
			<div
				role="alert"
				aria-live="polite"
				className="pointer-events-auto relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
			>
				<div className={`absolute inset-y-0 left-0 w-[3px] ${design.accent}`} />

				<div className="flex items-center gap-3 px-4 py-3">
					<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${design.iconStyle}`}>{design.icon}</div>

					<div className="min-w-0 flex-1">
						<h4 className="truncate text-[13px] font-bold tracking-wide text-white">{title || design.defaultTitle}</h4>

						<p className="mt-0.5 line-clamp-2 text-xs font-medium leading-5 text-slate-400">{message}</p>
					</div>

					<button
						type="button"
						onClick={handleClose}
						aria-label="Close notification"
						className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition duration-200 hover:bg-white/10 hover:text-white active:scale-90"
					>
						<X size={15} />
					</button>
				</div>

				{duration > 0 && show && (
					<div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
						<div
							key={`${type}-${message}-${show}`}
							style={progressStyle}
							className={`h-full w-full origin-left animate-[alertProgress_linear_forwards] ${design.progress}`}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

/* -------------------------------- */
/* Global alert provider            */
/* -------------------------------- */

interface ShowAlertOptions {
	type?: AlertType;
	title?: string;
	message: string;
	duration?: number;
}

interface AlertState {
	id: number;
	show: boolean;
	type: AlertType;
	title?: string;
	message: string;
	duration: number;
}

interface AlertContextValue {
	showAlert: (options: ShowAlertOptions) => void;

	success: (message: string, title?: string, duration?: number) => void;

	error: (message: string, title?: string, duration?: number) => void;

	warning: (message: string, title?: string, duration?: number) => void;

	info: (message: string, title?: string, duration?: number) => void;

	closeAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

const initialAlert: AlertState = { id: 0, show: false, type: 'success', title: '', message: '', duration: 3500 };

export function AlertProvider({ children }: { children: ReactNode }) {
	const [alert, setAlert] = useState<AlertState>(initialAlert);

	const showAlert = useCallback(({ type = 'success', title, message, duration = 3500 }: ShowAlertOptions) => {
		setAlert({ id: Date.now(), show: true, type, title, message, duration });
	}, []);

	const closeAlert = useCallback(() => {
		setAlert((previous) => ({ ...previous, show: false }));
	}, []);

	const success = useCallback(
		(message: string, title = 'Success', duration = 3500) => {
			showAlert({ type: 'success', title, message, duration });
		},
		[showAlert],
	);

	const error = useCallback(
		(message: string, title = 'Something went wrong', duration = 3500) => {
			showAlert({ type: 'error', title, message, duration });
		},
		[showAlert],
	);

	const warning = useCallback(
		(message: string, title = 'Warning', duration = 3500) => {
			showAlert({ type: 'warning', title, message, duration });
		},
		[showAlert],
	);

	const info = useCallback(
		(message: string, title = 'Information', duration = 3500) => {
			showAlert({ type: 'info', title, message, duration });
		},
		[showAlert],
	);

	return (
		<AlertContext.Provider value={{ showAlert, success, error, warning, info, closeAlert }}>
			{children}

			<TopAlert
				key={alert.id}
				show={alert.show}
				type={alert.type}
				title={alert.title}
				message={alert.message}
				duration={alert.duration}
				onClose={closeAlert}
			/>
		</AlertContext.Provider>
	);
}

export function useAlert(): AlertContextValue {
	const context = useContext(AlertContext);

	if (!context) {
		throw new Error('useAlert must be used inside AlertProvider');
	}

	return context;
}
