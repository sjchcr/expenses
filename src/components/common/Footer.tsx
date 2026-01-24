import { useMobile } from "@/hooks/useMobile";

const Footer = () => {
  const isMobile = useMobile();

  return (
    <footer
      className={`py-6 border-t text-center text-sm text-gray-500 bottom-4 ${isMobile ? "pb-28" : ""}`}
    >
      <p>
        © {new Date().getFullYear()} {import.meta.env.VITE_SITE_TITLE}. All
        rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
