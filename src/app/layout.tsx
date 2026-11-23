import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://el-fasl.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EL FASL | الفصل — مش مجرد شرح.. تجربة مختلفة كل يوم",
    template: "%s | الفصل",
  },
  description:
    "منصة تفاعلية للمعلّمين: تحديات يومية، مواقف تربوية واقعية، ألعاب صفية، وتبادل خبرات — تجربة مختلفة كل يوم داخل الفصل.",
  keywords: ["الفصل", "EL FASL", "معلمين", "تدريس", "تحديات تعليمية", "إدارة الفصل"],
  authors: [{ name: "EL FASL" }],
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    siteName: "EL FASL | الفصل",
    title: "EL FASL | الفصل — مش مجرد شرح.. تجربة مختلفة كل يوم",
    description:
      "منصة تفاعلية للمعلّمين: تحديات يومية، مواقف تربوية واقعية، ألعاب صفية، وتبادل خبرات.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EL FASL | الفصل — مش مجرد شرح.. تجربة مختلفة كل يوم",
    description: "منصة تفاعلية للمعلّمين: تحديات يومية، مواقف تربوية، وألعاب صفية.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#101828",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Class-based dark mode, persisted in a cookie (never localStorage).
  const cookieStore = await cookies();
  const theme = cookieStore.get("el-fasl-theme")?.value;
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${plex.variable} h-full ${theme === "dark" ? "dark" : ""}`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
