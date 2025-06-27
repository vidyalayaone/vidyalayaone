export function generateOTP(length = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
}
