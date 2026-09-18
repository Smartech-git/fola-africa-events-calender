"use client";

import { ReactNode, useEffect, useState } from "react";

import { motion, useMotionValue, useSpring } from "framer-motion";

import { cn, toRgbaWithAlpha } from "@/lib/utils";

interface FollowCursorProps {
  children?: ReactNode;
  size?: number;
  scaleOnHover?: number;
  color?: string;
  borderWidth?: number;
  zIndex?: number;
  stiffness?: number;
  damping?: number;
  className?: string;
  isLight?: boolean
}

export default function FollowCursor({
  children,
  size = 90,
  scaleOnHover = 1,
  color = "#221001",
  borderWidth = 1,
  zIndex = 9999,
  stiffness = 260,
  damping = 24,
  className,
}: FollowCursorProps) {
  const x = useMotionValue(-size);
  const y = useMotionValue(-size);
  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });
  const [isHovering, setIsHovering] = useState(false);
  const hasChildren = children !== undefined && children !== null;

  const _transparentBg = toRgbaWithAlpha(color, 0.3);

  const updatePointerPosition = (clientX: number, clientY: number) => {
    x.set(clientX - size / 2);
    y.set(clientY - size / 2);
  };

  useEffect(() => {
    if (hasChildren) return;

    const onPointerMove = (event: PointerEvent) => {
      updatePointerPosition(event.clientX, event.clientY);
      setIsHovering(true);
    };

    const hideCursor = () => {
      setIsHovering(false);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
    };
  }, [hasChildren, size, x, y]);

  const cursor = (
    <motion.div
      aria-hidden="true"
      initial={{ scale: 0.3 }}
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
        borderRadius: "9999px",
        backgroundColor: hasChildren ? "transparent" : "transparent",
        borderStyle: "solid",
        borderWidth: `${borderWidth}px`,
        borderColor: hasChildren ? "transparent" : "transparent",
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex,
        opacity: isHovering ? 1 : 0,
      }}
      animate={{
        scale: hasChildren && isHovering ? scaleOnHover : 0.3,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 28,
      }}
    />
  );

  if (!hasChildren) {
    return <div className={cn("w-fit", className)}>{cursor}</div>;
  }

  return (
    <div
      className={cn("w-fit", className)}
      onPointerEnter={(event) => {
        setIsHovering(true);
        updatePointerPosition(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        updatePointerPosition(event.clientX, event.clientY);
      }}
      onPointerLeave={() => {
        setIsHovering(false);
      }}
    >
      {children}
      {cursor}
    </div>
  );
}
