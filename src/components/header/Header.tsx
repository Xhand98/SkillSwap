import { Text } from "@/components/text";
import SkillSwap from "@/icons/logo";

const Header = () => {
  return (
    <header className="flex flex-row pt-1 pl-2">
      <SkillSwap size={55} />
      <Text size="paragraph-xl" className="leading-15 pl-2">
        SkillSwap
      </Text>
    </header>
  );
};

export default Header;
