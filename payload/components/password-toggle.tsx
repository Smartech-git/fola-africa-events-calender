"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Eye, EyeOff } from "lucide-react";
import { createRoot, type Root } from "react-dom/client";

import styles from "@/payload/components/password-toggle.module.css";

const PASSWORD_INPUTS = ".field-type.password input:not([data-password-toggle])";

function PasswordToggle({ input }: { input: HTMLInputElement }) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    // React leaves the input's type alone after this, as its prop never changes.
    input.setAttribute("type", visible ? "password" : "text");
    setVisible(!visible);
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="Show password"
      aria-pressed={visible}
      aria-controls={input.id || undefined}
      title={visible ? "Hide password" : "Show password"}
      onClick={toggle}
    >
      {visible ? (
        <EyeOff size={16} aria-hidden="true" />
      ) : (
        <Eye size={16} aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * Payload's password field has no show/hide control and no slot for one, so
 * this admin provider adds a toggle beside every password input it renders:
 * login, create first user, reset password and change password.
 */
export function PasswordToggleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mounted = new Map<HTMLInputElement, Root>();

    const sync = () => {
      document
        .querySelectorAll<HTMLInputElement>(PASSWORD_INPUTS)
        .forEach((input) => {
          const parent = input.parentElement;
          if (!parent) return;
          input.dataset.passwordToggle = "";
          parent.classList.add(styles.wrap);
          const host = document.createElement("span");
          parent.appendChild(host);
          const root = createRoot(host);
          root.render(<PasswordToggle input={input} />);
          mounted.set(input, root);
        });
      // Fields that left the page (a closed drawer, a new view) unmount.
      for (const [input, root] of mounted) {
        if (input.isConnected) continue;
        mounted.delete(input);
        queueMicrotask(() => root.unmount());
      }
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      for (const root of mounted.values()) queueMicrotask(() => root.unmount());
    };
  }, []);

  return children;
}
