// Disable right-click
document.addEventListener('contextmenu', e => e.preventDefault());

// Disable image dragging
document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
});

// Disable common shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' ||
       (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) ||
       (e.ctrlKey && e.key.toLowerCase() === 'u') ||
       (e.ctrlKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
    }
});