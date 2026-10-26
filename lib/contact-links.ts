/** tel: link for a North American number as stored in the panel ("647 834 2000", "(647) 834-2000"). */
export function telHref(phone: string): string {
  return `tel:+1${phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")}`;
}
