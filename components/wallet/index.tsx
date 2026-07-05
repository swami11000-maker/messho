'use client';

import {
	AlertCircle,
	ArrowRight,
	BadgeCheck,
	Banknote,
	Check,
	CheckCircle2,
	CircleDollarSign,
	Copy,
	ExternalLink,
	LoaderCircle,
	LogOut,
	Network,
	RefreshCw,
	Send,
	ShieldCheck,
	Sparkles,
	Unplug,
	Wallet,
	WalletCards,
	Zap,
} from 'lucide-react';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { apiCall } from '@/hooks/api-call-hook';
import type { ApiResponse } from '@/libs/types';

interface EthereumProvider {
	request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;
	on?: (event: string, callback: (...args: unknown[]) => void) => void;
	removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
	interface Window {
		ethereum?: EthereumProvider;
	}
}

type NoticeType = 'success' | 'error' | 'info';

interface Notice {
	type: NoticeType;
	message: string;
}

interface WalletStatusResponse {
	walletAddress?: string | null;
	verified?: boolean;
}

interface StatusBadgeProps {
	type: 'success' | 'warning' | 'neutral' | 'danger';
	children: ReactNode;
}

const SEPOLIA_CHAIN_ID = '0xaa36a7';
const ETH_INR_RATE = Number(process.env.NEXT_PUBLIC_ETH_INR_RATE ?? '84160');

const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET ?? '';

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

const NETWORKS: Record<string, string> = { '0x1': 'Ethereum Mainnet', '0xaa36a7': 'Sepolia Testnet', '0x89': 'Polygon', '0x38': 'BNB Smart Chain' };

function shortAddress(address?: string | null) {
	if (!address) return 'Not available';
	return `${address.slice(0, 7)}...${address.slice(-5)}`;
}

function formatBalance(value: bigint) {
	const base = BigInt(10) ** BigInt(18);
	const whole = value / base;
	const fraction = value % base;

	const decimals = fraction
		.toString()
		.padStart(18, '0')
		.slice(0, 5)
		.replace(/0+$/, '');

	return decimals ? `${whole}.${decimals}` : whole.toString();
}

function parseEther(value: string) {
	const sanitized = value.trim();

	if (!/^\d+(\.\d+)?$/.test(sanitized)) {
		throw new Error('Invalid ETH amount.');
	}

	const [whole = '0', fraction = ''] = sanitized.split('.');
	const paddedFraction = fraction.padEnd(18, '0').slice(0, 18);

	const WEI = BigInt(10) ** BigInt(18);

	return BigInt(whole) * WEI + BigInt(paddedFraction || '0');
}
function toHex(value: bigint) {
	return `0x${value.toString(16)}`;
}

function StatusBadge({ type, children }: StatusBadgeProps) {
	const styles = {
		success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
		warning: 'border-amber-200 bg-amber-50 text-amber-700',
		neutral: 'border-slate-200 bg-slate-50 text-slate-600',
		danger: 'border-rose-200 bg-rose-50 text-rose-700',
	};

	return (
		<span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.13em] ${styles[type]}`}>
			<span
				className={`h-1.5 w-1.5 rounded-full ${type === 'success' ? 'bg-emerald-500' : type === 'warning' ? 'bg-amber-500' : type === 'danger' ? 'bg-rose-500' : 'bg-slate-400'}`}
			/>
			{children}
		</span>
	);
}

function IconBox({ children, variant = 'blue' }: { children: ReactNode; variant?: 'blue' | 'green' | 'dark' | 'amber' }) {
	const variants = {
		blue: 'bg-blue-50 text-blue-600 ring-blue-100',
		green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
		dark: 'bg-slate-950 text-white ring-slate-200',
		amber: 'bg-amber-50 text-amber-600 ring-amber-100',
	};

	return <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${variants[variant]}`}>{children}</div>;
}

function CopyButton({ value, onCopied }: { value: string; onCopied: (message: string) => void }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		if (!value) return;

		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			onCopied('Address copied successfully.');

			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			onCopied('Unable to copy the address.');
		}
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			disabled={!value}
			className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
		>
			{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
			{copied ? 'Copied' : 'Copy'}
		</button>
	);
}

function InformationCard({ title, label, icon, badge, children }: { title: string; label: string; icon: ReactNode; badge?: ReactNode; children?: ReactNode }) {
	return (
		<div className="group rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					{icon}

					<div>
						<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">{label}</p>

						<h3 className="mt-1 break-all text-base font-extrabold text-slate-950">{title}</h3>
					</div>
				</div>

				{badge}
			</div>
			{children}
		</div>
	);
}

export default function WalletPage() {
	const [walletDetected, setWalletDetected] = useState(false);
	const [address, setAddress] = useState('');
	const [savedWallet, setSavedWallet] = useState('');
	const [chainId, setChainId] = useState('');
	const [balance, setBalance] = useState('0');
	const [verified, setVerified] = useState(false);

	const [amount, setAmount] = useState('5000');
	const [loadingAction, setLoadingAction] = useState<'connect' | 'switch' | 'verify' | 'payment' | 'balance' | null>(null);

	const [notice, setNotice] = useState<Notice | null>(null);
	const [transactionHash, setTransactionHash] = useState('');

	const isConnected = Boolean(address);
	const isSepolia = chainId === SEPOLIA_CHAIN_ID;
	const networkName = NETWORKS[chainId] ?? 'Unsupported network';

	const numericAmount = Number(amount) || 0;

	const ethAmount = useMemo(() => {
		if (numericAmount <= 0 || ETH_INR_RATE <= 0) {
			return 0;
		}

		return numericAmount / ETH_INR_RATE;
	}, [numericAmount]);

	const showNotice = useCallback((type: NoticeType, message: string) => {
		setNotice({ type, message });

		window.setTimeout(() => {
			setNotice(null);
		}, 4500);
	}, []);

	const getProvider = useCallback(() => {
		return typeof window !== 'undefined' ? window.ethereum : undefined;
	}, []);

	const refreshBalance = useCallback(
		async (walletAddress?: string) => {
			const provider = getProvider();
			const selectedAddress = walletAddress ?? address;

			if (!provider || !selectedAddress) return;

			try {
				setLoadingAction('balance');

				const rawBalance = await provider.request<string>({ method: 'eth_getBalance', params: [selectedAddress, 'latest'] });

				setBalance(formatBalance(BigInt(rawBalance)));
			} catch (error) {
				console.error('Balance error:', error);
				setBalance('0');
			} finally {
				setLoadingAction(null);
			}
		},
		[address, getProvider],
	);

 	const loadSavedWallet = useCallback(async () => {
 		try {
 			const response = await apiCall<{ success: boolean; data: { walletAddress?: string | null; verified?: boolean } }>('GET', '/wallet/status');
 			if (response.success && response.data) {
 				setSavedWallet(response.data.walletAddress ?? '');
 				setVerified(Boolean(response.data.verified));
 			}
 		} catch {
 			// Saved-wallet API is optional during initial UI integration.
 		}
 	}, []);

	const hydrateWallet = useCallback(async () => {
		const provider = getProvider();
		setWalletDetected(Boolean(provider));

		if (!provider) return;

		try {
			const [accounts, currentChainId] = await Promise.all([provider.request<string[]>({ method: 'eth_accounts' }), provider.request<string>({ method: 'eth_chainId' })]);

			const selectedAddress = accounts[0] ?? '';

			setAddress(selectedAddress);
			setChainId(currentChainId);

			if (selectedAddress) {
				await refreshBalance(selectedAddress);
			}
		} catch (error) {
			console.error('Wallet hydration error:', error);
		}
	}, [getProvider, refreshBalance]);

	useEffect(() => {
		hydrateWallet();
		loadSavedWallet();

		const provider = getProvider();

		if (!provider?.on) return;

		const handleAccountsChanged = (...args: unknown[]) => {
			const accounts = args[0] as string[];
			const nextAddress = accounts?.[0] ?? '';

			setAddress(nextAddress);
			setBalance('0');

			if (nextAddress) {
				refreshBalance(nextAddress);
			}
		};

		const handleChainChanged = (...args: unknown[]) => {
			const nextChainId = args[0] as string;
			setChainId(nextChainId);

			if (address) {
				refreshBalance(address);
			}
		};

		provider.on('accountsChanged', handleAccountsChanged);
		provider.on('chainChanged', handleChainChanged);

		return () => {
			provider.removeListener?.('accountsChanged', handleAccountsChanged);

			provider.removeListener?.('chainChanged', handleChainChanged);
		};
	}, [address, getProvider, hydrateWallet, loadSavedWallet, refreshBalance]);

	const connectWallet = async () => {
		const provider = getProvider();

		if (!provider) {
			showNotice('error', 'MetaMask was not detected. Install or enable the extension.');
			return;
		}

		try {
			setLoadingAction('connect');

			const accounts = await provider.request<string[]>({ method: 'eth_requestAccounts' });

			const currentChainId = await provider.request<string>({ method: 'eth_chainId' });

			const selectedAddress = accounts[0] ?? '';

			setAddress(selectedAddress);
			setChainId(currentChainId);

			if (selectedAddress) {
				await refreshBalance(selectedAddress);
			}

			showNotice('success', 'Wallet connected successfully.');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Wallet connection was rejected.';

			showNotice('error', message);
		} finally {
			setLoadingAction(null);
		}
	};

	const disconnectWallet = async () => {
		const provider = getProvider();

		try {
			await provider?.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] });
		} catch {
			// Some wallets do not support wallet_revokePermissions.
		}

		setAddress('');
		setBalance('0');
		setTransactionHash('');

		showNotice('info', 'Browser wallet session disconnected.');
	};

	const switchToSepolia = async () => {
		const provider = getProvider();

		if (!provider) {
			showNotice('error', 'MetaMask was not detected.');
			return;
		}

		try {
			setLoadingAction('switch');

			await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: SEPOLIA_CHAIN_ID }] });

			setChainId(SEPOLIA_CHAIN_ID);

			if (address) {
				await refreshBalance(address);
			}

			showNotice('success', 'Switched to Sepolia Testnet.');
		} catch (error) {
			const walletError = error as { code?: number };

			if (walletError.code === 4902) {
				try {
					await provider.request({
						method: 'wallet_addEthereumChain',
						params: [
							{
								chainId: SEPOLIA_CHAIN_ID,
								chainName: 'Sepolia Testnet',
								nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
								rpcUrls: ['https://rpc.sepolia.org'],
								blockExplorerUrls: ['https://sepolia.etherscan.io'],
							},
						],
					});

					setChainId(SEPOLIA_CHAIN_ID);
					showNotice('success', 'Sepolia was added and selected.');
				} catch {
					showNotice('error', 'Unable to add Sepolia network.');
				}
			} else {
				showNotice('error', 'Network switch was cancelled or failed.');
			}
		} finally {
			setLoadingAction(null);
		}
	};

	const verifyAndLinkWallet = async () => {
		const provider = getProvider();

		if (!provider || !address) {
			showNotice('error', 'Connect your wallet first.');
			return;
		}

		if (!isSepolia) {
			showNotice('error', 'Switch to Sepolia Testnet before verification.');
			return;
		}

		try {
			setLoadingAction('verify');

			const nonceResponse = await fetch('/api/wallet/nonce', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ address }),
			});

			const nonceResult = await nonceResponse.json();

			if (!nonceResponse.ok || !nonceResult.message) {
				throw new Error(nonceResult.message ?? 'Unable to generate verification message.');
			}

			const signature = await provider.request<string>({ method: 'personal_sign', params: [nonceResult.message, address] });

			const verificationResponse = await fetch('/api/wallet/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ address, message: nonceResult.message, signature }),
			});

			const verificationResult = await verificationResponse.json();

			if (!verificationResponse.ok) {
				throw new Error(verificationResult.message ?? 'Wallet verification failed.');
			}

			setVerified(true);
			setSavedWallet(address);

			showNotice('success', 'Wallet verified and linked successfully.');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Wallet verification was cancelled.';

			showNotice('error', message);
		} finally {
			setLoadingAction(null);
		}
	};

	const payWithMetaMask = async () => {
		const provider = getProvider();

		if (!provider || !address) {
			showNotice('error', 'Connect your wallet first.');
			return;
		}

		if (!isSepolia) {
			showNotice('error', 'Switch to Sepolia Testnet before payment.');
			return;
		}

		if (!verified) {
			showNotice('error', 'Verify and link your wallet before payment.');
			return;
		}

		if (!TREASURY_WALLET) {
			showNotice('error', 'Treasury wallet is not configured.');
			return;
		}

		if (numericAmount < 100) {
			showNotice('error', 'Minimum deposit amount is ₹100.');
			return;
		}

		try {
			setLoadingAction('payment');

			const exactEthAmount = ethAmount.toFixed(18);
			const transactionValue = parseEther(exactEthAmount);

			const hash = await provider.request<string>({ method: 'eth_sendTransaction', params: [{ from: address, to: TREASURY_WALLET, value: toHex(transactionValue) }] });

			setTransactionHash(hash);

			const depositResponse = await apiCall<ApiResponse>('POST', '/wallet/deposit', {
				transactionHash: hash,
				senderAddress: address,
				receiverAddress: TREASURY_WALLET,
				inrAmount: numericAmount,
				ethAmount: exactEthAmount,
				chainId,
				rate: ETH_INR_RATE,
			});

			if (depositResponse.success) {
				showNotice('success', 'Transaction submitted. Your deposit is being verified.');
			} else {
				throw new Error(depositResponse.message ?? 'Transaction sent, but backend registration failed.');
			}

			await refreshBalance(address);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Payment was cancelled or failed.';

			showNotice('error', message);
		} finally {
			setLoadingAction(null);
		}
	};

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe_0,_transparent_32%),radial-gradient(circle_at_bottom_right,_#dcfce7_0,_transparent_28%),#f8fafc] px-4 py-6 text-slate-900 md:px-7 lg:px-10">
			<div className="mx-auto max-w-[1500px] space-y-6">
				{notice && (
					<div
						className={`fixed right-4 top-4 z-50 flex max-w-md items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
							notice.type === 'success'
								? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
								: notice.type === 'error'
									? 'border-rose-200 bg-rose-50/95 text-rose-800'
									: 'border-blue-200 bg-blue-50/95 text-blue-800'
						}`}
					>
						{notice.type === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}

						<p className="text-sm font-semibold leading-6">{notice.message}</p>
					</div>
				)}

				<section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/85 shadow-[0_25px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl">
					<div className="relative border-b border-slate-200/70 px-5 py-6 md:px-8">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,99,235,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,0.035)_1px,transparent_1px)] bg-[size:34px_34px]" />

						<div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
							<div className="flex items-start gap-4">
								<div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_15px_35px_rgba(37,99,235,0.28)]">
									<WalletCards className="h-7 w-7" />

									<span className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-[3px] border-white ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
								</div>

								<div>
									<div className="mb-2 flex flex-wrap items-center gap-2">
										<StatusBadge type={isConnected ? 'success' : 'neutral'}>{isConnected ? 'Wallet connected' : 'Wallet disconnected'}</StatusBadge>

										{verified && <StatusBadge type="success">Verified</StatusBadge>}
									</div>

									<h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Wallet &amp; deposit center</h1>

									<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Securely connect MetaMask, verify ownership and deposit through the Sepolia Testnet.</p>
								</div>
							</div>

							<div className="flex flex-wrap gap-3">
								{isConnected && !isSepolia && (
									<button
										type="button"
										onClick={switchToSepolia}
										disabled={loadingAction === 'switch'}
										className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 text-sm font-extrabold text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{loadingAction === 'switch' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
										Switch to Sepolia
									</button>
								)}

								{isConnected ? (
									<button
										type="button"
										onClick={disconnectWallet}
										className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
									>
										<LogOut className="h-4 w-4" />
										Disconnect
									</button>
								) : (
									<button
										type="button"
										onClick={connectWallet}
										disabled={loadingAction === 'connect' || !walletDetected}
										className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{loadingAction === 'connect' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
										Connect MetaMask
									</button>
								)}
							</div>
						</div>
					</div>

					<div className="grid gap-6 p-5 md:p-8 xl:grid-cols-[1.35fr_0.65fr]">
						<div className="grid gap-4 md:grid-cols-2">
							<InformationCard
								label="Browser wallet"
								title={isConnected ? shortAddress(address) : 'Not connected'}
								icon={
									<IconBox variant="blue">
										<Wallet className="h-5 w-5" />
									</IconBox>
								}
								badge={<StatusBadge type={isConnected ? 'success' : 'neutral'}>{isConnected ? 'Connected' : 'Offline'}</StatusBadge>}
							>
								<div className="mt-5 flex items-center gap-2">
									<div className="min-w-0 flex-1 truncate rounded-xl bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-500">{address || 'No wallet address'}</div>

									<CopyButton
										value={address}
										onCopied={(message) => showNotice('success', message)}
									/>
								</div>
							</InformationCard>

							<InformationCard
								label="Saved wallet"
								title={savedWallet ? shortAddress(savedWallet) : 'Not linked'}
								icon={
									<IconBox variant="green">
										<ShieldCheck className="h-5 w-5" />
									</IconBox>
								}
								badge={<StatusBadge type={verified ? 'success' : 'neutral'}>{verified ? 'Verified' : 'Not linked'}</StatusBadge>}
							>
								<div className="mt-5 flex items-center gap-2">
									<div className="min-w-0 flex-1 truncate rounded-xl bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-500">
										{savedWallet || 'Verify ownership to save wallet'}
									</div>

									<CopyButton
										value={savedWallet}
										onCopied={(message) => showNotice('success', message)}
									/>
								</div>
							</InformationCard>

							<InformationCard
								label="Active network"
								title={isConnected ? networkName : 'Not available'}
								icon={
									<IconBox variant={isSepolia ? 'green' : 'dark'}>
										<Network className="h-5 w-5" />
									</IconBox>
								}
								badge={isConnected ? <StatusBadge type={isSepolia ? 'success' : 'warning'}>{isSepolia ? 'Supported' : 'Switch required'}</StatusBadge> : undefined}
							>
								<p className="mt-4 text-xs font-semibold text-slate-500">
									Chain ID: <span className="text-slate-900">{chainId ? Number.parseInt(chainId, 16) : '—'}</span>
								</p>
							</InformationCard>

							<InformationCard
								label="Wallet balance"
								title={isConnected ? `${balance} ETH` : 'Not available'}
								icon={
									<IconBox variant="green">
										<CircleDollarSign className="h-5 w-5" />
									</IconBox>
								}
								badge={
									isConnected ? (
										<button
											type="button"
											onClick={() => refreshBalance(address)}
											disabled={loadingAction === 'balance'}
											className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
											aria-label="Refresh balance"
										>
											<RefreshCw className={`h-4 w-4 ${loadingAction === 'balance' ? 'animate-spin' : ''}`} />
										</button>
									) : undefined
								}
							>
								<p className="mt-4 text-xs font-semibold text-slate-500">Native token balance on the selected network.</p>
							</InformationCard>

							<div className="rounded-[24px] border border-slate-200 bg-gradient-to-r from-blue-50/70 to-white p-5 md:col-span-2">
								<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
									<div className="flex items-center gap-3">
										<IconBox variant={verified ? 'green' : 'blue'}>{verified ? <BadgeCheck className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}</IconBox>

										<div>
											<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">Verification status</p>

											<h3 className="mt-1 text-base font-extrabold text-slate-950">{verified ? 'Wallet ownership verified' : 'Verification pending'}</h3>
										</div>
									</div>

									<StatusBadge type={verified ? 'success' : 'warning'}>{verified ? 'Completed' : 'Action required'}</StatusBadge>
								</div>
							</div>
						</div>

						<aside className="rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_22px_50px_rgba(15,23,42,0.2)] md:p-6">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300">Wallet verification</p>

									<h2 className="mt-2 text-xl font-black">{verified ? 'Wallet secured' : 'Verify ownership'}</h2>
								</div>

								<div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
									<Sparkles className="h-5 w-5 text-blue-300" />
								</div>
							</div>

							<p className="mt-3 text-sm leading-6 text-slate-300">Sign a secure message inside MetaMask. This does not send a transaction or charge gas.</p>

							<div className="mt-6 space-y-3">
								{[
									{ title: 'Connect browser wallet', done: isConnected },
									{ title: 'Switch to Sepolia', done: isSepolia },
									{ title: 'Sign verification message', done: verified },
								].map((step, index) => (
									<div
										key={step.title}
										className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3.5"
									>
										<div
											className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
												step.done ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-slate-300'
											}`}
										>
											{step.done ? <Check className="h-4 w-4" /> : index + 1}
										</div>

										<p className={`text-sm font-bold ${step.done ? 'text-white' : 'text-slate-300'}`}>{step.title}</p>
									</div>
								))}
							</div>

							{!isConnected ? (
								<button
									type="button"
									onClick={connectWallet}
									disabled={loadingAction === 'connect' || !walletDetected}
									className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white font-extrabold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Wallet className="h-4 w-4" />
									Connect MetaMask
								</button>
							) : !isSepolia ? (
								<button
									type="button"
									onClick={switchToSepolia}
									disabled={loadingAction === 'switch'}
									className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 font-extrabold text-amber-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{loadingAction === 'switch' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
									Switch to Sepolia
								</button>
							) : (
								<button
									type="button"
									onClick={verifyAndLinkWallet}
									disabled={verified || loadingAction === 'verify'}
									className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{loadingAction === 'verify' ? (
										<LoaderCircle className="h-4 w-4 animate-spin" />
									) : verified ? (
										<BadgeCheck className="h-4 w-4" />
									) : (
										<ShieldCheck className="h-4 w-4" />
									)}

									{verified ? 'Wallet verified' : 'Verify and link wallet'}
								</button>
							)}
						</aside>
					</div>
				</section>

				<section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-[0_25px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl">
					<div className="flex flex-col justify-between gap-5 border-b border-slate-200/70 px-5 py-6 md:flex-row md:items-center md:px-8">
						<div className="flex items-start gap-4">
							<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_14px_30px_rgba(16,185,129,0.25)]">
								<Banknote className="h-6 w-6" />
							</div>

							<div>
								<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Deposit via MetaMask</p>

								<h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Fund your account</h2>

								<p className="mt-1 text-sm leading-6 text-slate-500">Send the exact quoted amount to the configured treasury wallet.</p>
							</div>
						</div>

						<StatusBadge type={isSepolia ? 'success' : 'warning'}>{isSepolia ? 'Sepolia Testnet' : 'Wrong network'}</StatusBadge>
					</div>

					<div className="grid gap-6 p-5 md:p-8 xl:grid-cols-[1fr_380px]">
						<div>
							<div className="grid gap-5 md:grid-cols-2">
								<div>
									<label
										htmlFor="deposit-amount"
										className="mb-2 block text-sm font-extrabold text-slate-800"
									>
										Deposit amount
									</label>

									<div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
										<span className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">₹</span>

										<input
											id="deposit-amount"
											type="number"
											min="100"
											step="100"
											value={amount}
											onChange={(event) => setAmount(event.target.value)}
											className="h-full min-w-0 flex-1 bg-transparent text-base font-extrabold text-slate-950 outline-none"
											placeholder="Enter INR amount"
										/>
									</div>

									<div className="mt-3 flex flex-wrap gap-2">
										{QUICK_AMOUNTS.map((quickAmount) => (
											<button
												type="button"
												key={quickAmount}
												onClick={() => setAmount(String(quickAmount))}
												className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
													numericAmount === quickAmount
														? 'border-blue-600 bg-blue-600 text-white'
														: 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
												}`}
											>
												₹{quickAmount.toLocaleString('en-IN')}
											</button>
										))}
									</div>
								</div>

								<div>
									<label className="mb-2 block text-sm font-extrabold text-slate-800">You will send</label>

									<div className="flex h-14 items-center rounded-2xl border border-blue-100 bg-blue-50/70 px-4">
										<span className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
											<CircleDollarSign className="h-4 w-4" />
										</span>

										<p className="truncate text-base font-black text-slate-950">{ethAmount.toFixed(8)} ETH</p>
									</div>

									<p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
										Quote: 1 ETH = <span className="font-extrabold text-slate-800">₹{ETH_INR_RATE.toLocaleString('en-IN')}</span>
									</p>
								</div>
							</div>

							<div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
								<div className="grid gap-4 md:grid-cols-3">
									<div>
										<p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Network</p>

										<p className="mt-1.5 text-sm font-extrabold text-slate-900">{networkName}</p>
									</div>

									<div>
										<p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Sender</p>

										<p className="mt-1.5 truncate font-mono text-xs font-bold text-slate-900">{address || 'Not connected'}</p>
									</div>

									<div>
										<p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Verification</p>

										<p className={`mt-1.5 text-sm font-extrabold ${verified ? 'text-emerald-600' : 'text-amber-600'}`}>{verified ? 'Verified' : 'Required'}</p>
									</div>
								</div>

								<div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
									<div className="min-w-0 flex-1">
										<p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Treasury receiver</p>

										<p className="mt-1.5 truncate font-mono text-xs font-bold text-slate-700">{TREASURY_WALLET || 'Not configured'}</p>
									</div>

									<CopyButton
										value={TREASURY_WALLET}
										onCopied={(message) => showNotice('success', message)}
									/>
								</div>
							</div>

							{transactionHash && (
								<a
									href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
									target="_blank"
									rel="noreferrer"
									className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 transition hover:bg-emerald-100"
								>
									<div className="min-w-0">
										<p className="text-xs font-extrabold uppercase tracking-[0.14em]">Transaction submitted</p>

										<p className="mt-1 truncate font-mono text-xs">{transactionHash}</p>
									</div>

									<ExternalLink className="h-5 w-5 shrink-0" />
								</a>
							)}
						</div>

						<aside className="rounded-[26px] bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950 p-5 text-white shadow-[0_20px_50px_rgba(37,99,235,0.24)]">
							<div className="flex items-center justify-between">
								<p className="text-xs font-bold uppercase tracking-[0.17em] text-blue-100">Payment summary</p>

								<Send className="h-5 w-5 text-blue-200" />
							</div>

							<div className="mt-6 space-y-4">
								<div className="flex items-center justify-between gap-4">
									<span className="text-sm text-blue-100">Deposit amount</span>

									<span className="font-black">₹{numericAmount.toLocaleString('en-IN')}</span>
								</div>

								<div className="flex items-center justify-between gap-4">
									<span className="text-sm text-blue-100">Network</span>

									<span className="font-black">Sepolia</span>
								</div>

								<div className="flex items-center justify-between gap-4">
									<span className="text-sm text-blue-100">Estimated ETH</span>

									<span className="font-black">{ethAmount.toFixed(8)}</span>
								</div>

								<div className="border-t border-white/15 pt-4">
									<div className="flex items-end justify-between gap-4">
										<span className="text-sm text-blue-100">Total to send</span>

										<div className="text-right">
											<p className="text-2xl font-black">{ethAmount.toFixed(8)}</p>
											<p className="text-xs font-bold text-blue-200">ETH</p>
										</div>
									</div>
								</div>
							</div>

							<button
								type="button"
								onClick={payWithMetaMask}
								disabled={loadingAction === 'payment' || !isConnected || !isSepolia || !verified || numericAmount < 100 || !TREASURY_WALLET}
								className="mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{loadingAction === 'payment' ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}

								{loadingAction === 'payment' ? 'Confirm in MetaMask' : 'Pay with MetaMask'}

								{loadingAction !== 'payment' && <ArrowRight className="h-4 w-4" />}
							</button>

							<div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
								<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />

								<p className="text-xs leading-5 text-blue-100">Always confirm the receiver, network and amount inside MetaMask before approving.</p>
							</div>
						</aside>
					</div>
				</section>

				<div className="flex items-center justify-center gap-2 pb-3 text-xs font-semibold text-slate-400">
					<Unplug className="h-3.5 w-3.5" />
					Browser wallet connection and saved wallet verification are handled separately.
				</div>
			</div>
		</main>
	);
}
