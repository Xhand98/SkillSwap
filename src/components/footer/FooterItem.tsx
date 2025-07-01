import Link from "next/link";

const FooterItem = ({ text, href }: { text: string; href: string }) => {
  return (
    <li>
      <Link
        className="hover:opacity-100 hover:text-primary opacity-60 transition-opacity text-foreground hover:underline"
        aria-label={text}
        href={href}
      >
        {text}
      </Link>
    </li>
  );
};

export default FooterItem;
