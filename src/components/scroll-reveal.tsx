"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Starting direction of entry */
  from?: "up" | "down" | "left" | "right" | "fade";
};

export function ScrollReveal({ children, className, delay = 0, from = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const translate = !visible
    ? from === "up"
      ? "translate-y-8"
      : from === "down"
      ? "-translate-y-8"
      : from === "left"
      ? "-translate-x-8"
      : from === "right"
      ? "translate-x-8"
      : ""
    : "translate-x-0 translate-y-0";

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100" : "opacity-0",
        translate,
        className
      )}
    >
      {children}
    </div>
  );
}
