const STORAGE_KEY = "prompts_storage"

const state = {
    prompts: [],
    selectedID: null,
}

const elements = {
    promptTitle: document.getElementById('prompt-title'),
    promptContent: document.getElementById('prompt-content'),
    titleWrapper: document.getElementById('title-wrapper'),
    contentWrapper: document.getElementById('content-wrapper'),
    btnOpen: document.getElementById("btn-open"),
    btnCollapse: document.getElementById("btn-collapse"),
    sidebar: document.querySelector('.sidebar'),
    btnSave: document.getElementById('btn-save'),
    list: document.getElementById('prompt-list'),
    search: document.getElementById('search-input'),
    btnNew: document.getElementById('btn-new'),
    btnCopy: document.getElementById('btn-copy'),
    btnTheme: document.getElementById('btn-theme'),
    appLogo: document.getElementById('app-logo'),
    copyIcon: document.getElementById('copy-icon'),
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

function openSidebar() {
    elements.sidebar.classList.add("open");
    elements.sidebar.classList.remove("collapsed");
}

function closeSidebar() {
    elements.sidebar.classList.remove("open");
    elements.sidebar.classList.add("collapsed");
}

function save() {
    const title = elements.promptTitle.textContent.trim();
    const content = elements.promptContent.innerHTML.trim();
    const hasContent = elements.promptContent.textContent.trim()

    if (!title || !hasContent) {
        alert("Título e conteúdo não podem estar vazios.");
        return;
    }

    // return console.log(state.selectedID)

    if (state.selectedID) {
        const existingPrompt = state.prompts.find((p) => p.id === state.selectedID);

        if (existingPrompt) {
            existingPrompt.title = title || "Sem título";
            existingPrompt.content = content || "Sem conteúdo";
        }
    } else {
        const newPrompt = {
            id: Date.now().toString(),
            title, //Igual a title: title
            content, //Igual a content: content
        };

        // Adiciona o prompt no início da lista
        state.prompts.unshift(newPrompt);
        state.selectedID = newPrompt.id;

    }

    renderList(elements.search.value);
    persist();
    alert("Prompt salvo com sucesso!");

}

function newPrompt() {
    state.selectedID = null;
    elements.promptTitle.textContent = "";
    elements.promptContent.innerHTML = "";
    updateAllEditableStates();
    elements.promptTitle.focus();
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
    } catch (error) {
        console.error("Erro ao salvar no localStorage:", error);
    }
}

function load() {
    try {
        const storage = localStorage.getItem(STORAGE_KEY);
        state.prompts = storage ? JSON.parse(storage) : [];
        state.selectedID = null;

    } catch (error) {
        console.error("Erro ao carregar do localStorage:", error);
    }
}

function createPromptListItem(prompt) {
    const tmp = document.createElement('div');
    tmp.innerHTML = prompt.content;

    return `
        <li class="prompt-item" data-id="${prompt.id}" data-action="select">
            <div class="prompt-item-content">
            <span class="prompt-item-title">${prompt.title}</span>
            <span class="prompt-item-description">${tmp.textContent}</span>
            </div>

            <button class="icon-button" id="icon-trash" aria-label="Remover prompt" data-action="remove">
            <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
            </button>
        </li>
    `
}

function renderList(filterText = "") {
    const filteredPrompts = state.prompts.filter(prompt =>
        prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())).map((p) => createPromptListItem(p)).join("");

    elements.list.innerHTML = filteredPrompts;
}

function copySelected() {
    try {

        const content = elements.promptContent

        if (!navigator.clipboard) {
            console.log("A API de área de transferência não é suportada neste navegador.");
            return;
        }

        navigator.clipboard.writeText(content.innerText);
        alert("Conteúdo copiado para a área de transferência!");

    } catch (error) {
        console.error("Erro ao copiar para a área de transferência:", error);
    }
}

elements.btnSave.addEventListener('click', save);

elements.btnNew.addEventListener('click', newPrompt);

elements.search.addEventListener('input', (event) => {
    renderList(event.target.value);
})

elements.list.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('[data-action="remove"]');
    const item = event.target.closest('[data-id]');

    if (!item) return

    const id = item.getAttribute('data-id');
    state.selectedID = id;

    if (removeBtn) {
        state.prompts = state.prompts.filter(p => p.id !== id);
        renderList(elements.search.value);
        persist();
        return
    }

    if (event.target.closest('[data-action="select"]')) {
        const prompt = state.prompts.find(p => p.id === id);
        if (prompt) {
            elements.promptTitle.textContent = prompt.title;
            elements.promptContent.innerHTML = prompt.content;
            updateAllEditableStates()
        }
    }
});

elements.btnCopy.addEventListener('click', copySelected)


const THEME_KEY = 'app_theme'; // localStorage key

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        elements.btnTheme && (elements.btnTheme.textContent = 'Dark Mode');
        // Troca assets para tema claro
        if (elements.appLogo) elements.appLogo.src = 'assets/logo_light_mode.svg';
        if (elements.copyIcon) elements.copyIcon.src = 'assets/copy_light_mode.png';
    } else {
        root.removeAttribute('data-theme');
        elements.btnTheme && (elements.btnTheme.textContent = 'Light Mode');
        // Troca assets para tema escuro (padrão)
        if (elements.appLogo) elements.appLogo.src = 'assets/logo.svg';
        if (elements.copyIcon) elements.copyIcon.src = 'assets/copy.svg';
    }
}

function toggleTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

function init() {
    load();
    renderList('');
    attachAllEditableHandlers();
    updateAllEditableStates();

    elements.sidebar.classList.remove("open");
    elements.sidebar.classList.remove("collapsed");

    elements.btnOpen.addEventListener('click', openSidebar);
    elements.btnCollapse.addEventListener('click', closeSidebar);

    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);
    if (elements.btnTheme) {
        elements.btnTheme.addEventListener('click', toggleTheme);
    }
}

init();