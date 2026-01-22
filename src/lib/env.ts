export const isSidePanel = typeof window !== 'undefined' &&
    (window.location.pathname.includes('side_panel') || new URLSearchParams(window.location.search).get('type') === 'side_panel');
