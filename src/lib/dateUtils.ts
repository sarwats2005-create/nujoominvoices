// Formats a Date to YYYY-MM-DD using LOCAL time (avoids UTC shift)
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses YYYY-MM-DD string to Date using LOCAL time (avoids UTC shift)
export function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date();
  // If it's already an ISO string with time, extract just the date part
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}
