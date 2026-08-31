const RootLayout = ({ children }: LayoutProps<'/'>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
