
document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.getElementById('cta-identificar');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(event) {
            event.preventDefault(); 
            window.location.href = '/reconhecedor'; 
        });
    }

});