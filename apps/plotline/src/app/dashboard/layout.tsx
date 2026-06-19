export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-8 py-10">
      {children}
    </div>
  );
}
