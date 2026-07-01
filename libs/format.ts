

export const formatMoney = (paise: number) =>
	new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
	}).format(paise / 100)
	

export const formatDate = (value: string) =>
	new Intl.DateTimeFormat('en-IN', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));

export const shortWallet = (address: string) =>
	address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address || 'Not connected';