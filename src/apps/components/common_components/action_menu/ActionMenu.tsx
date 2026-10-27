import './ActionMenu.css';
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { IconType } from "react-icons";
import { FiMoreVertical } from "react-icons/fi";

export interface ActionMenuItem {
  label: string;
  icon?: IconType;
  onClick: () => void;
  danger?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
}

const MENU_WIDTH = 160;
const GAP = 4;

// "⋮" button that opens a small menu of row actions.
// The menu is rendered in <body> so table scroll containers don't clip it.
const ActionMenu = ({ items, label = "Actions" }: ActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Below the button, right aligned; flips above when there's no room underneath
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const button = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const fitsBelow = button.bottom + GAP + menuHeight <= window.innerHeight;
    setPosition({
      top: fitsBelow ? button.bottom + GAP : button.top - GAP - menuHeight,
      left: Math.max(8, button.right - MENU_WIDTH),
    });
  }, [open]);

  // Close on outside click, Escape, scroll or resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <>
      <button
        ref={buttonRef}
        className={`action-menu-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
      >
        <FiMoreVertical />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="action-menu"
            role="menu"
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          >
            {items.map(({ label: itemLabel, icon: Icon, onClick, danger }) => (
              <button
                key={itemLabel}
                role="menuitem"
                className={`action-menu-item ${danger ? "danger" : ""}`}
                onClick={() => {
                  setOpen(false);
                  onClick();
                }}
              >
                {Icon && <Icon />}
                {itemLabel}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default ActionMenu;
