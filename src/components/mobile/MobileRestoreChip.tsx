import { RotateCcw, X } from "lucide-react";

interface Props {
  show: boolean;
  onRestore: () => void;
  onDismiss: () => void;
  label?: string;
}

const MobileRestoreChip = ({ show, onRestore, onDismiss, label = "Restore last values?" }: Props) => {
  if (!show) return null;
  return (
    <div className="md:hidden flex justify-center -mt-1 mb-2">
      <div className="restore-chip" role="status">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        <button type="button" onClick={onRestore}>{label}</button>
        <button
          type="button"
          onClick={onDismiss}
          className="dismiss"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default MobileRestoreChip;
