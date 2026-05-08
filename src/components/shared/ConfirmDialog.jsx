import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({isOpen, onClose, onConfirm, title, description, message, confirmText = 'Confirmar', cancelText = 'Cancelar',
}) {
  const texto = description ?? message;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center space-y-4 py-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-slate-600">{texto}</p>
        <div className="flex w-full gap-3 mt-4 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}