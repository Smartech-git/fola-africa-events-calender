"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Eye, EyeOff } from "lucide-react";
import { createRoot } from "react-dom/client";

import styles from "@/payload/components/password-toggle.module.css";

const PASSWORD_INPUTS = ".field-type.password input:not([data-password-toggle])";

/**
 * React writes `input.type` again on every re-render of the field, and the
 * field re-renders on each keystroke, which would hide the password again.
 * This takes over the input's `type` so only the toggle decides it.
 */
function controlType(input: HTMLInputElement) {
  const type = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "type",
  );
  let visible = false;
  const apply = () => type?.set?.call(input, visible ? "text" : "password");

  Object.defineProperty(input, "type", {
    configurable: true,
    get: () => type?.get?.call(input),
    set: apply,
  });

  return (next: boolean) => {
    visible = next;
    apply();
  };
}

function PasswordToggle({
  controls,
  show,
}: {
  controls?: string;
  show: (visible: boolean) => void;
}) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    show(!visible);
    setVisible(!visible);
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="Show password"
      aria-pressed={visible}
      aria-controls={controls}
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

/** Adds the toggle beside an input and returns a function that removes it. */
function attach(input: HTMLInputElement, parent: HTMLElement) {
  input.dataset.passwordToggle = "";
  parent.classList.add(styles.wrap);
  const host = document.createElement("span");
  parent.appendChild(host);
  const root = createRoot(host);
  root.render(
    <PasswordToggle
      controls={input.id || undefined}
      show={controlType(input)}
    />,
  );

  // Undo everything, so the next run (React runs effects twice in
  // development) attaches a fresh toggle instead of skipping the input.
  return () => {
    delete input.dataset.passwordToggle;
    parent.classList.remove(styles.wrap);
    Reflect.deleteProperty(input, "type");
    input.type = "password";
    queueMicrotask(() => {
      root.unmount();
      host.remove();
    });
  };
}

/**
 * Payload's password field has no show/hide control and no slot for one, so
 * this admin provider adds a toggle beside every password input it renders:
 * login, create first user, reset password and change password.
 */
export function PasswordToggleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mounted = new Map<HTMLInputElement, () => void>();

    const sync = () => {
      document
        .querySelectorAll<HTMLInputElement>(PASSWORD_INPUTS)
        .forEach((input) => {
          if (input.parentElement)
            mounted.set(input, attach(input, input.parentElement));
        });
      // Fields that left the page (a closed drawer, a new view) unmount.
      for (const [input, detach] of mounted) {
        if (input.isConnected) continue;
        mounted.delete(input);
        detach();
      }
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      for (const detach of mounted.values()) detach();
    };
  }, []);

  return children;
}
