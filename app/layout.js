import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import RouteLoader from "@/components/RouteLoader";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  titleTemplate: "%s | Grainlly E-Commerce",
  defaultTitle: "Grainlly E-Commerce",
  description: "Experience the ultimate e-commerce experience with Next.js",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: "/favicon_io/favicon-32x32.png",
    shortcut: "/favicon_io/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/favicon_io/favicon-16x16.png", sizes: "16x16" },
      { rel: "icon", url: "/favicon_io/favicon-32x32.png", sizes: "32x32" },
      { rel: "android-chrome", url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512" },
      { rel: "manifest", url: "/favicon_io/site.webmanifest" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased text-gray-700`} suppressHydrationWarning>
          <Toaster />
          <AppContextProvider>
            <RouteLoader>
              {children}
            </RouteLoader>
          </AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
