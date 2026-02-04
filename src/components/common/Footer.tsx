import { useMobile } from "@/hooks/useMobile";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });
  return (
    <footer
      className={`py-6 border-t text-center text-sm text-gray-500 bottom-4 ${
        isMobile ? "pb-28" : ""
      }`}
    >
      <p>
        © {new Date().getFullYear()} {siteTitle}. {t("footer.rights")}
      </p>
    </footer>
  );
};

export default Footer;
