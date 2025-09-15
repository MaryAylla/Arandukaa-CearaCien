// static/js/reconhecer.js (VERSÃO FINAL E ROBUSTA)

// Importa a função 'client' da biblioteca que adicionamos no base.html
import { client } from "https://cdn.jsdelivr.net/npm/@gradio/client@0.1.4/dist/index.min.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- Referência ao seu Space no Hugging Face (NÃO é uma URL) ---
    const HUGGING_FACE_SPACE_ID = 'MaryAylla/arandukaa';
    // -----------------------------------------------------------

    const recognizerArea = document.getElementById('recognizer-area');
    const resultArea = document.getElementById('result-area');
    const resultCard = document.getElementById('result-card');
    const inputFile = document.getElementById('imagem');
    const fileNameDisplay = document.getElementById('file-name-display');
    const btnEnviar = document.getElementById('btn-enviar'); // O botão de identificar
    
    let imageFile = null;

    // Função que lida com a seleção de uma imagem
    function handleFileSelect(file) {
        if (file) {
            imageFile = file;
            fileNameDisplay.textContent = `Arquivo selecionado: ${imageFile.name}`;
            btnEnviar.classList.remove('hidden'); // Mostra o botão "Identificar"
        }
    }

    // Evento para quando um arquivo é selecionado no input
    if (inputFile) {
        inputFile.addEventListener('change', () => {
            handleFileSelect(inputFile.files[0]);
        });
    }

    // Função principal que envia a imagem para a API
    async function submitImageForIdentification() {
        if (!imageFile) {
            alert('Por favor, selecione uma imagem primeiro.');
            return;
        }

        recognizerArea.classList.add('hidden');
        resultCard.innerHTML = `<p class="loading-text">Analisando imagem... 🧠 Por favor, aguarde. O servidor da IA pode estar inicializando.</p>`;
        resultArea.classList.remove('hidden');
        
        try {
            const app = await client(HUGGING_FACE_SPACE_ID);
            const imageBlob = new Blob([imageFile], { type: imageFile.type });
            const result = await app.predict('/predict', [imageBlob]);
            const data = result.data[0];

            if (data.error) { throw new Error(data.error); }
            
            console.log("Resultado recebido:", data);

            const detailPageUrl = `../planta/${data.slug}/`;

            resultCard.innerHTML = `
                <img src="../static/images/${data.imagem_principal}" alt="Imagem de ${data.nome_popular}" class="result-image">
                <div class="result-details">
                    <h1 class="plant-name">${data.nome_popular}</h1>
                    <p class="scientific-name">${data.nome_cientifico}</p>
                    <div class="confidence-badge">
                        Nossa IA tem <strong>${data.confianca.toFixed(1)}%</strong> de certeza.
                    </div>
                    <p class="description">${data.curiosidades}</p>
                    <a href="${detailPageUrl}" class="cta-button">
                        <i class="fas fa-book"></i> Ver Detalhes Completos
                    </a>
                </div>
            `;
        } catch (error) {
            console.error('Erro na identificação:', error);
            resultCard.innerHTML = `<p class="error-text">Ocorreu um erro ao identificar a planta. Por favor, tente novamente. (Detalhe: ${error.message})</p>`;
        }
    }

    // Evento de clique para o botão "Identificar Planta"
    if (btnEnviar) {
        btnEnviar.addEventListener('click', submitImageForIdentification);
    }
    
    // NOTA: A lógica da câmera foi removida para simplificar e garantir o funcionamento.
    // Podemos readicioná-la depois que o upload de arquivo estiver 100% funcional.
});