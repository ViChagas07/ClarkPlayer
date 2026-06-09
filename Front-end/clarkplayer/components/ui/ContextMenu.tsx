"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { MoreHorizontal } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  trigger?: React.ReactNode;
  items: MenuItem[];
  trackId: string;
  className?: string;
}

export function ContextMenu({ trigger, items, trackId, className }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Calculate position relative to viewport
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let x = rect.right + 4;
      let y = rect.top;

      // Keep menu within viewport
      if (typeof window !== "undefined") {
        const menuWidth = 200;
        const menuHeight = items.length * 40 + 16;
        if (x + menuWidth > window.innerWidth) {
          x = rect.left - menuWidth - 4;
        }
        if (y + menuHeight > window.innerHeight) {
          y = window.innerHeight - menuHeight - 8;
        }
        if (y < 8) y = 8;
      }

      setPosition({ x, y });
      setIsOpen(true);
    },
    [items.length]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, close]);

  return (
    <>
      <button
        ref={triggerRef}
        aria-label="Open options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={open}
        onContextMenu={open}
        className={cn(
          "p-1.5 rounded-lg text-muted hover:text-body hover:bg-bg-tertiary",
          "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent",
          "cursor-pointer",
          className
        )}
      >
        {trigger ?? <MoreHorizontal size={16} />}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Options for track ${trackId}`}
            className="fixed z-[100] min-w-[180px] rounded-xl bg-bg-tertiary border border-white/10 shadow-xl py-1"
            style={{ top: position.y, left: position.x }}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  close();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm text-left",
                  "transition-colors duration-150",
                  item.disabled
                    ? "text-muted/40 cursor-not-allowed"
                    : item.danger
                    ? "text-danger hover:bg-danger/10"
                    : "text-body hover:bg-white/5"
                )}
              >
                {item.icon && (
                  <span className={cn(item.danger ? "text-danger" : "text-muted")}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
