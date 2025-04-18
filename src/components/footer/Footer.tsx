import { Text } from "@/components/text";
import locale from "@/locales/root.json";
import FooterTable from "./FooterTable";
import SkillSwap from "@/icons/logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="print:hidden shadow-xl border-t-2 bg[#1a1a1a] text-white py-4">
      <div className="sm:flex-row flex flex-col justify-between mx-auto max-w-7xl gap-6 min-h-[10rem] sm:p-20 p-10">
        <div>
          <SkillSwap size={75} />
          <div className="grid grid-cols-1 grid-flow-row place-content-center gap-6">
            <div>
              <Text
                as="h2"
                className="col-span-3 text-primary"
                size="heading-3"
              >
                SkillSwap
              </Text>
              <Text as="small" className="col-span-3" size="label-sm">
                © {currentYear} {locale.WEBSITE.NAME}.
              </Text>
            </div>
          </div>
        </div>
        <div className="grid sm:place-content-start sm:grid-cols-2 lg:place-content-center lg:grid-cols-3">
          <FooterTable />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
