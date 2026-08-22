import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"SojiTracker",description:"A calm place to turn goals into action."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
