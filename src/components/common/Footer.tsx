import { useMobile } from "@/hooks/useMobile";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const siteTitle = t("siteTitle", {
    defaultValue: import.meta.env.VITE_SITE_TITLE,
  });
  return (
    <footer
      className={`py-6 border-t text-center text-sm text-gray-500 bottom-4 flex flex-col sm:flex-row justify-center items-center ${
        isMobile ? "pb-28" : ""
      }`}
    >
      <p>
        © {new Date().getFullYear()} {siteTitle}. {t("footer.rights")}
      </p>
      <Link to="/privacy">
        <Button variant="link">{t("privacy.title")}</Button>
      </Link>
    </footer>
  );
};

export default Footer;
