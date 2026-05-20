// Controle global da tecla Enter para avançar as telas
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        // Evita o comportamento padrão (como recarregar a página em formulários)
        event.preventDefault();

        // Verifica qual tela está ativa e clica no botão correspondente
        if (!nameSection.classList.contains('hidden') && !nextNameButton.disabled) {
            nextNameButton.click();
        } 
        else if (!lastNameSection.classList.contains('hidden') && !nextLastNameButton.disabled) {
            nextLastNameButton.click();
        } 
        else if (!proficiencySection.classList.contains('hidden') && !nextProficiencyButton.disabled) {
            nextProficiencyButton.click();
        } 
        else if (!preparationSection.classList.contains('hidden')) {
            startQuizButton.click();
        } 
        else if (!quizSection.classList.contains('hidden') && !nextButton.disabled) {
            nextButton.click();
        } 
        else if (!resultsSection.classList.contains('hidden') && !restartButton.disabled) {
            restartButton.click();
        }
    }
});
