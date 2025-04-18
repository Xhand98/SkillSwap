import { Text } from "@/components/text";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <p className="text-center">
          © {currentYear} SkillSwap. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
