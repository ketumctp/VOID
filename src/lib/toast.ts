import toast, { type ToastOptions } from 'react-hot-toast';

const baseOptions: ToastOptions = {
    duration: 3000,
    position: 'bottom-center',
    style: {
        background: '#1a1a1a',
        color: '#e8e3d5',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        maxWidth: '350px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        fontWeight: '500',
    },
};

export const notify = {
    success: (message: string, options?: ToastOptions) => {
        return toast.success(message, {
            ...baseOptions,
            iconTheme: {
                primary: '#10b981',
                secondary: 'white',
            },
            ...options
        });
    },
    error: (message: string, options?: ToastOptions) => {
        return toast.error(message, {
            ...baseOptions,
            iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
            },
            ...options
        });
    },
    loading: (message: string, options?: ToastOptions) => {
        return toast.loading(message, { ...baseOptions, ...options });
    },
    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    },
    custom: (message: string, options?: ToastOptions) => {
        return toast(message, { ...baseOptions, ...options });
    }
};

export default notify;
