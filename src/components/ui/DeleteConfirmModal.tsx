import React from 'react';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ open, onClose, onDelete }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-lg w-[537px] max-w-full min-h-[224px] p-8 relative flex flex-col items-center">
        <div className="flex items-center w-full mb-6 relative">
          <h2 className="text-xl font-bold text-left flex-1">Delete</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="z-10 p-0.5 rounded-lg bg-white hover:bg-neutral-200 transition-colors cursor-pointer flex items-center justify-center absolute right-0 top-0"
            style={{ lineHeight: 1 }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 4L20 20M20 4L4 20" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-gray-700 mb-6 w-full text-left">Are you sure to delete?</p>
        <div className="flex w-full justify-end gap-3">
          <button
            onClick={onClose}
            className="w-[120px] h-[48px] px-6 py-2 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="w-[171px] h-[48px] px-8 py-2 rounded-full bg-[#F82C5A] text-white font-semibold hover:bg-[#e0244e] transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;