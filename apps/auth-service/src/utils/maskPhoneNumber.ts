// Helper function to mask phone number
export function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone;
  const visibleEnd = phone.slice(-3);
  const masked = '*'.repeat(phone.length - 3);
  return masked + visibleEnd;
}
