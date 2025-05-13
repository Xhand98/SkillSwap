import { ShadcnLink } from "@/components/ui/link";

const FooterItem = ({ text, href }: { text: string; href: string }) => {
  return (
    <li>
      <ShadcnLink
        variant="underlineHover"
        className="opacity-60 hover:opacity-100 hover:text-primary transition-opacity text-foreground"
        href={href}
        aria-label={text}
      >
        {text}
      </ShadcnLink>
    </li>
  );
};

export default FooterItem;
