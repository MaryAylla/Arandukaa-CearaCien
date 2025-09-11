function setupReconhecedor() {
    console.log("Função setupReconhecedor() foi chamada. Tentando encontrar os elementos...");

    const uploadArea = document.getElementById('upload-area');
    const cameraArea = document.getElementById('camera-area');
    const btnAbrirCamera = document.getElementById('btn-abrir-camera');
    const btnCapturar = document.getElementById('btn-capturar');
    const btnEnviar = document.getElementById('btn-enviar');
    const inputFile = document.getElementById('imagem');
    const videoElement = document.getElementById('camera-view');
    const canvasElement = document.getElementById('canvas-captura');
    const formReconhecedor = document.getElementById('form-reconhecedor');
    const fileNameDisplay = document.getElementById('file-name-display');
    const separatorText = document.querySelector('.separator-text');

    let stream;

    if (formReconhecedor && btnAbrirCamera && inputFile) {
        console.log("Elementos encontrados com sucesso! Adicionando os event listeners...");

        btnAbrirCamera.addEventListener('click', async () => {
            console.log("Botão 'Usar a Câmera' clicado.");
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                videoElement.srcObject = stream;
                
                uploadArea.classList.add('hidden');
                btnAbrirCamera.classList.add('hidden');
                separatorText.classList.add('hidden');
                cameraArea.classList.remove('hidden');

            } catch (error) {
                console.error("Erro ao acessar a câmera: ", error);
                alert("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
            }
        });

        btnCapturar.addEventListener('click', () => {
            console.log("Botão 'Tirar Foto' clicado.");
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            const context = canvasElement.getContext('2d');
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

            stream.getTracks().forEach(track => track.stop());
            cameraArea.classList.add('hidden');

            canvasElement.toBlob(blob => {
                const file = new File([blob], "captura.jpg", { type: "image/jpeg" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                inputFile.files = dataTransfer.files;

                fileNameDisplay.textContent = 'Foto capturada!';
                uploadArea.classList.remove('hidden');
                btnEnviar.classList.remove('hidden');

            }, 'image/jpeg');
        });

        inputFile.addEventListener('change', () => {
            console.log("Arquivo selecionado via upload.");
            if (inputFile.files.length > 0) {
                fileNameDisplay.textContent = inputFile.files[0].name;
                btnEnviar.classList.remove('hidden');
                btnAbrirCamera.classList.add('hidden');
                separatorText.classList.add('hidden');
            }
        });

        formReconhecedor.addEventListener('submit', (event) => {
            if (inputFile.files.length === 0) {
                event.preventDefault();
                alert('Por favor, envie um arquivo ou capture uma foto antes de identificar.');
            }
        });

    } else {
        console.error("Erro Crítico: Um ou mais elementos essenciais do reconhecedor não foram encontrados na página.");
    }
}

window.addEventListener('load', setupReconhecedor);