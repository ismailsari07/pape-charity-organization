export const metadata = {
  title: "Admin Paneli",
  description: "Admin yönetim paneli",
  icons: {
    icon: "/favicon.ico",
  },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-neutral-950">{children}</div>;
}
