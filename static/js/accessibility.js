document.addEventListener('DOMContentLoaded', function() {
    const btnOuvir = document.getElementById('btn-ouvir');
    const containerLeitura = document.getElementById('container-leitura');
    
    if ('speechSynthesis' in window && btnOuvir && containerLeitura) {
        
        btnOuvir.addEventListener('click', function() {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
                btnOuvir.textContent = '🔊 Ouvir o texto';
                btnOuvir.classList.remove('speaking');
                return;
            }

            const textoParaFalar = containerLeitura.textContent;

            const utterance = new SpeechSynthesisUtterance(textoParaFalar);

            utterance.lang = 'pt-BR';

            utterance.onend = function() {
                btnOuvir.textContent = '🔊 Ouvir o texto';
                btnOuvir.classList.remove('speaking');
            };

            speechSynthesis.speak(utterance);
            btnOuvir.textContent = '⏹️ Parar leitura';
            btnOuvir.classList.add('speaking');
        });

    } else {
        if(btnOuvir) {
            btnOuvir.style.display = 'none';
        }
    }
});