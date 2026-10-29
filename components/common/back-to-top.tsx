"use client";

import { useState } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ChevronUp } from "lucide-react";

import Button from "@/components/ui/button";

const SHOW_AFTER = 600;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const lenis = useLenis(({ scroll }) => setVisible(scroll > SHOW_AFTER));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="back-to-top"
          className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-70 sm:right-8 sm:bottom-[calc(2rem+env(safe-area-inset-bottom))]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Button
            variant="solid"
            size="icon"
            aria-label="Back to top"
            className="rounded-full border border-white hover:bg-ink"
            onPress={() => lenis?.scrollTo(0, { immediate: !!reduceMotion })}
          >
            <ChevronUp size={18} aria-hidden="true" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
