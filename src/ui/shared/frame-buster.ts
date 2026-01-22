// CRIT-NEW-001: Frame Busting Protection
if (window.self !== window.top) {
    window.close(); // Close immediately if in iframe
    document.documentElement.style.display = 'none'; // Hide content as backup
} else {
    // Reveal content if verified (optional if we default to hidden in CSS)
    document.documentElement.style.display = 'block';
}
