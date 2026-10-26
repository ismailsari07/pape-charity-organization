import type { SVGProps } from "react";

/** The app's mosque line icon (youth-toronto assets/icons/mosque.svg). */
export default function MosqueIcon({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 21h18" />
      <path d="M5 21v-7" />
      <path d="M19 21v-7" />
      <path d="M7.5 21v-4.6a4.5 4.5 0 0 1 9 0V21" />
      <path d="M12 3.2c2.6 2 4.5 3.9 4.5 6.3h-9C7.5 7.1 9.4 5.2 12 3.2Z" />
      <path d="M5 14V9.6" />
      <path d="M19 14V9.6" />
    </svg>
  );
}
