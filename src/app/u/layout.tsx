import Footer from "@/components/Footer"
import PublicPageNavbar from "./[username]/components/PublicPageNavbar"

export const metadata = {
    title: 'Next.js',
    description: 'Generated by Next.js',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <PublicPageNavbar />
            {children}
            <Footer />
        </>
    )
}
