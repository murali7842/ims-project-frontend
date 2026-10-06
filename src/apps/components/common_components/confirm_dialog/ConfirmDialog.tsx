import Modal from "../modal/Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  title,
  message,
  confirmText = "Delete",
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      width={420}
      footer={
        <>
          <button className="btn-outline-grey" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger-red" onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait..." : confirmText}
          </button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{message}</p>
      {error && <p className="form-error-banner">{error}</p>}
    </Modal>
  );
};

export default ConfirmDialog;
