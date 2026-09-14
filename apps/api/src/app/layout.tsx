export const metadata = {
  title: 'Navaja Studio OS API',
  description: 'Backend API para el sistema de gestión de barbería',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
