"use client";

import { type Notify as NotifyType, getNotify } from "@/app/_actions/notify";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X as CloseIcon } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import type { SkillSwapContent } from "../types";
import useNotify from "./useNotify";

const Notify = forwardRef<HTMLDivElement, SkillSwapContent>(
  ({ className, ...rest }, ref) => {
    const { isOpen, close, open } = useNotify();
    const handleClose = () => close();
    const [message, setMessage] = useState<NotifyType | undefined>(undefined);

    useEffect(() => {
      const updateMessage = async () => {
        const message = await getNotify();
        if (message) {
          setMessage(message);
          open();
        }
      };

      updateMessage();
    }, [open]);

    if (!isOpen || !message) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "print:hidden flex flex-col flex-center w-screen bg-primary py-2 px-12 text-sm font-medium z-10 text-white",
          className
        )}
        {...rest}
      >
        <span className="inline-flex gap-2">
          {message.value}
          <Link
            href={message.link.href}
            className="text-white underline-offset-4 hover:underline text-sm"
          >
            {message.link.value}
          </Link>
        </span>
        <Button
          aria-label="Cerrar notificación"
          name="close"
          size="icon"
          variant="ghost"
          className="text-white absolute right-4 mr-0 xss:sm:mr-10 max-h-full rounded-full"
          onClick={handleClose}
        >
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);

Notify.displayName = "SkillSwap.Notify";

export default Notify;
