import { Button, ButtonGroup } from "@heroui/react";
import { Text } from "@/components/text";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import locale from "@/locales/home.json";
import RectangleIcon from "../_icons/Rectangle";

export default function HeroSection() {
  return (
    <section className="relative flex mt-10 flex-col items-start justify-center w-full h-fit py-20 sm:px-10">
      <div className="relative inset-0" />
      <div className="relative z-10 flex flex-col justify-center">
        <Text as={"h1"} size="heading-4" className="max-w-screen">
          {locale.SECTION1.TITLE}
        </Text>
        <Text as={"p"} size="paragraph-xl" className="max-w-fit mt-6">
          {locale.SECTION1.DESCRIPTION}
        </Text>
        <RectangleIcon
          width={45}
          height={45}
          className="absolute top-10 right-40 rotate-180 w-24 h-24 object-contain"
        />
        <RectangleIcon
          width={30}
          height={30}
          className="absolute top-30 left-0 rotate-0 w-24 h-24 object-contain"
        />
        <div className="flex items-center justify-center content-center gap-40 mt-10 pt-20 min-w-screen ">
          {locale.SECTION1.BUTTONS.map((element, index) => (
            <Button
              key={index}
              as={Link}
              className={element.CLASSES}
              href={element.LINK}
            >
              {element.TEXT == "Ingresar" ? (
                <Text as={"p"} className="flex items-center gap-2">
                  {element.TEXT} <ArrowRightIcon />
                </Text>
              ) : (
                <Text className="flex items-center gap-2">{element.TEXT}</Text>
              )}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
