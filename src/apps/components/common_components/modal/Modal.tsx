import './Modal.css';
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  title: string;
  // Called by the ✕ button and Escape. Clicking outside the dialog does nothing.
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

// Open modals, newest last: Escape only closes the top one
// (e.g. the "discard changes?" dialog, not the form under it)
const openModals: symbol[] = [];

const Modal = ({ title, onClose, children, footer, width = 560 }: ModalProps) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const id = Symbol(title);
    openModals.push(id);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openModals[openModals.length - 1] === id) {
        event.stopPropagation();
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      openModals.splice(openModals.indexOf(id), 1);
    };
    // Registered once per open modal so its place in the stack is kept
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-backdrop">
      <div
        className="modal-dialog-box"
        style={{ maxWidth: width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header-row">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <div className="modal-body-content">{children}</div>

        {footer && <div className="modal-footer-row">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
