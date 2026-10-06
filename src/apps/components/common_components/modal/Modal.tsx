import './Modal.css';
import { useEffect } from "react";
import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

const Modal = ({ title, onClose, children, footer, width = 560 }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-dialog-box"
        style={{ maxWidth: width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header-row">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
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
