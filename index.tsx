/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, GeneratedImage} from '@google/genai';

// Use the environment variable for the API key
const ai = new GoogleGenAI({apiKey:});

const selectedModel = 'imagen-4.0-generate-001';

const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const imageGallery = document.getElementById('image-gallery');
const spinner = document.getElementById('spinner');
const qualitySelect = document.getElementById('quality-select') as HTMLSelectElement;
const aspectRatioSelect = document.getElementById('aspect-ratio-select') as HTMLSelectElement;
const styleSelect = document.getElementById('style-select') as HTMLSelectElement;


async function generateImages() {
    if (!promptInput.value || !imageGallery || !generateBtn || !spinner || !qualitySelect || !aspectRatioSelect || !styleSelect) return;

    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
        alert("Lütfen bir istem girin.");
        return;
    }

    const stylePrompt = styleSelect.value;
    const imagenPrompt = `${userPrompt}${stylePrompt}`;

    // Show loading state
    generateBtn.disabled = true;
    spinner.classList.remove('hidden');
    imageGallery.innerHTML = ''; // Clear previous images

    try {
        const response = await ai.models.generateImages({
            model: selectedModel,
            prompt: imagenPrompt,
            config: {
                numberOfImages: 3,
                aspectRatio: aspectRatioSelect.value,
                outputMimeType: 'image/jpeg',
                includeRaiReason: true,
                quality: qualitySelect.value,
            },
        });

        if (response?.generatedImages) {
            response.generatedImages.forEach((generatedImage: GeneratedImage, index: number) => {
                if (generatedImage.image?.imageBytes) {
                    const src = `data:image/jpeg;base64,${generatedImage.image.imageBytes}`;
                    
                    // Create a container for the image and download button
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'relative group'; // 'group' for hover effects

                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `${imagenPrompt} - Resim ${index + 1}`;
                    img.className = 'w-full h-auto object-cover rounded-lg border-2 border-gray-700 shadow-lg group-hover:shadow-2xl transition-shadow duration-300';
                    
                    // Create download link
                    const downloadLink = document.createElement('a');
                    downloadLink.href = src;
                    downloadLink.download = `ai-generated-${Date.now()}-${index + 1}.jpeg`;
                    downloadLink.className = 'absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg';
                    downloadLink.setAttribute('aria-label', 'Resmi indir');
                    downloadLink.title = 'Resmi indir';
                    downloadLink.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    `;

                    imageContainer.appendChild(img);
                    imageContainer.appendChild(downloadLink);
                    imageGallery.appendChild(imageContainer);
                }
            });
        }
        
        console.log('Full response:', response);

    } catch (error) {
        console.error("Error generating images or processing response:", error);
        if (imageGallery) {
            const errorParagraph = document.createElement('p');
            errorParagraph.textContent = 'Hata: Resimler yüklenemedi. Ayrıntılar için konsolu kontrol edin.';
            errorParagraph.className = 'text-red-500 col-span-full text-center';
            imageGallery.appendChild(errorParagraph);
        }
    } finally {
        // Hide loading state
        generateBtn.disabled = false;
        spinner.classList.add('hidden');
    }
}

generateBtn.addEventListener('click', generateImages);

// Allow pressing Enter to generate, but Shift+Enter for a new line
promptInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        generateImages();
    }
});
