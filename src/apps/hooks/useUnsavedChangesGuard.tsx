import { useEffect, useState } from "react";
import ConfirmDialog from "../components/common_components/confirm_dialog/ConfirmDialog";

// Asks "Discard changes?" before leaving a form that has unsaved edits.
//
//   const { confirmLeave, discardDialog } = useUnsavedChangesGuard(isDirty);
//   <button onClick={() => confirmLeave(onClose)}>Cancel</button>
//   {discardDialog}
//
// With no edits, confirmLeave just runs the callback. While there are edits,
// refreshing or closing the browser tab also asks for confirmation.
export const useUnsavedChangesGuard = (isDirty: boolean) => {
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const confirmLeave = (leave: () => void) => {
    if (isDirty) {
      setPendingLeave(() => leave);
    } else {
      leave();
    }
  };

  const discardDialog = pendingLeave ? (
    <ConfirmDialog
      title="Discard changes?"
      message="You have unsaved changes. If you leave now, they will be lost."
      confirmText="Discard"
      cancelText="Keep editing"
      onConfirm={() => {
        setPendingLeave(null);
        pendingLeave();
      }}
      onCancel={() => setPendingLeave(null)}
    />
  ) : null;

  return { confirmLeave, discardDialog };
};
