import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, farmerName = 'this profile', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="space-y-4 text-left">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground mb-1">Delete Farmer Profile?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete the farm profile for <strong className="text-foreground">{farmerName}</strong>?
              This will perform a soft-delete on the records, marking them as inactive.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Delete Profile'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
