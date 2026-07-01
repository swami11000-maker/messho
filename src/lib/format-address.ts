export const formatAddress = (address?: string | null, head = 6, tail = 4) => {
  if (!address) return '';
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
};

export const normalizeAddress = (address: string) => address.trim().toLowerCase();

export const isSameAddress = (left?: string | null, right?: string | null) => {
  if (!left || !right) return false;
  return normalizeAddress(left) === normalizeAddress(right);
};
