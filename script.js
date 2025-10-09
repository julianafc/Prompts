const elements = {
    promptTitle: document.getElementById('prompt-title'),
    promptContent: document.getElementById('prompt-content'),
    titleWrapper: document.getElementById('title-wrapper'),
    contentWrapper: document.getElementById('content-wrapper')
};

function updateEditableWrapperState(element, wrapper) {
    const hasText = element.textContent.trim().length > 0

    wrapper.classList.toggle("is-empty", !hasText)
}

function updateAllEditableStates() {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}

function attachAllEditableHandlers() {
    elements.promptTitle.addEventListener('input', () => {
        updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
    });

    elements.promptContent.addEventListener('input', () => {
        updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
    });
}

function init() {
    attachAllEditableHandlers();
    updateAllEditableStates();
}

init();