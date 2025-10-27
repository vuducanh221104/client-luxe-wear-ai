import Header from "@/components/layout/header";
import Footer from "@/components/Footer";
import Testimonials from "@/components/sections/Testimonials";
import CtaBanner from "@/components/sections/CtaBanner";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="main">{children}</main>
      <Testimonials/>
      <CtaBanner/>
      <Footer />
    </>
  );
}
