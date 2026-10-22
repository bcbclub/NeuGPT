
/* =================================
   NEUGPT — INTERACTIONS
================================= */

const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");

const welcome = document.querySelector("#welcome");
const messages = document.querySelector("#messages");
const chatArea = document.querySelector("#chatArea");

const newChatButton = document.querySelector("#newChat");
const clearChatButton = document.querySelector("#clearChat");

const sidebar = document.querySelector("#sidebar");
const openSidebarButton = document.querySelector("#openSidebar");
const closeSidebarButton = document.querySelector("#closeSidebar");
const sidebarOverlay = document.querySelector("#sidebarOverlay");

const conversationList = document.querySelector("#conversationList");
const currentConversationButton =
  document.querySelector("#currentConversation");

const toast = document.querySelector("#toast");

let conversations = [];
let activeConversationId = null;
let nextConversationId = 1;
let toastTimeout;

/* =================================
   OUTILS
================================= */

function createConversation() {
  const conversation = {
    id: nextConversationId++,
    title: "Nouvelle conversation",
    messages: []
  };

  conversations.unshift(conversation);
  activeConversationId = conversation.id;

  renderConversationList();
  renderMessages();
  closeSidebar();

  input.value = "";
  resizeInput();
  input.focus();

  return conversation;
}

function getActiveConversation() {
  return conversations.find(
    conversation => conversation.id === activeConversationId
  );
}

function renderConversationList() {
  conversationList.replaceChildren();

  if (conversations.length === 0) {
    const empty = document.createElement("p");
    empty.className = "sidebar-label";
    empty.textContent = "Aucune conversation";
    conversationList.append(empty);
    return;
  }

  for (const conversation of conversations) {
    const button = document.createElement("button");
    button.className = "conversation-item";

    if (conversation.id === activeConversationId) {
      button.classList.add("active");
    }

    const icon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");

    const path = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    path.setAttribute(
      "d",
      "M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.8-3.6A7.5 7.5 0 1 1 20 11.5Z"
    );

    icon.append(path);

    const label = document.createElement("span");
    label.textContent = conversation.title;

    button.append(icon, label);

    button.addEventListener("click", () => {
      activeConversationId = conversation.id;
      renderConversationList();
      renderMessages();
      closeSidebar();
    });

    conversationList.append(button);
  }
}

function renderMessages() {
  messages.replaceChildren();

  const conversation = getActiveConversation();

  if (!conversation || conversation.messages.length === 0) {
    welcome.hidden = false;
    return;
  }

  welcome.hidden = true;

  for (const message of conversation.messages) {
    messages.append(createMessageElement(message));
  }

  scrollToBottom();
}

function createMessageElement(message) {
  const article = document.createElement("article");
  article.className = `message ${message.role}`;

  if (message.role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "N";
    article.append(avatar);
  }

  const content = document.createElement("div");
  content.className = "message-content";

  const author = document.createElement("div");
  author.className = "message-author";
  author.textContent = message.role === "user" ? "Vous" : "NeuGPT";

  const text = document.createElement("div");
  text.className = "message-text";

  // textContent empêche d'interpréter le message comme du HTML.
  text.textContent = message.text;

  content.append(author, text);
  article.append(content);

  return article;
}

function addMessage(role, text) {
  const conversation = getActiveConversation();

  if (!conversation) return;

  const message = { role, text };
  conversation.messages.push(message);

  if (role === "user" && conversation.messages.length === 1) {
    conversation.title =
      text.length > 30 ? `${text.slice(0, 30)}…` : text;

    renderConversationList();
  }

  welcome.hidden = true;
  messages.append(createMessageElement(message));
  scrollToBottom();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTo({
      top: chatArea.scrollHeight,
      behavior: "smooth"
    });
  });
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

/* =================================
   ENVOI DU MESSAGE
================================= */

function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) return;

  if (!getActiveConversation()) {
    createConversation();
  }

  addMessage("user", cleanText);

  input.value = "";
  resizeInput();

  /*
   * Démonstration uniquement :
   * cette version ne contacte pas encore une IA.
   */
  sendButton.disabled = true;

  const typingMessage = document.createElement("article");
  typingMessage.className = "message assistant";
  typingMessage.setAttribute("aria-label", "NeuGPT est en train de répondre");

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "N";

  const content = document.createElement("div");
  content.className = "message-content";

  const author = document.createElement("div");
  author.className = "message-author";
  author.textContent = "NeuGPT";

  const dots = document.createElement("div");
  dots.className = "typing-dots";
  dots.setAttribute("aria-label", "Réponse de démonstration en préparation");

  for (let i = 0; i < 3; i++) {
    dots.append(document.createElement("span"));
  }

  content.append(author, dots);
  typingMessage.append(avatar, content);
  messages.append(typingMessage);

  scrollToBottom();

  setTimeout(() => {
    typingMessage.remove();

    addMessage(
      "assistant",
      "Ton message a bien été ajouté à cette démonstration de NeuGPT. " +
      "Je ne suis pas encore connecté à un véritable moteur d’intelligence artificielle. " +
      "Cette prochaine étape permettra de recevoir de vraies réponses."
    );

    sendButton.disabled = false;
    input.focus();
  }, 800);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", resizeInput);

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    } else {
      sendMessage(input.value);
    }
  }
});

/* =================================
   SUGGESTIONS DE LA PAGE D'ACCUEIL
================================= */

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.prompt);
  });
});

/* =================================
   NOUVELLE CONVERSATION
================================= */

newChatButton.addEventListener("click", () => {
  createConversation();
});

/* =================================
   EFFACER LA CONVERSATION
================================= */

clearChatButton.addEventListener("click", () => {
  const conversation = getActiveConversation();

  if (!conversation || conversation.messages.length === 0) {
    showToast("Cette conversation est déjà vide.");
    return;
  }

  conversation.messages = [];
  conversation.title = "Nouvelle conversation";

  renderConversationList();
  renderMessages();

  showToast("Conversation effacée.");
});

/* =================================
   NAVIGATION MOBILE
================================= */

function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("visible");
  openSidebarButton.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
  openSidebarButton.setAttribute("aria-expanded", "false");
}

openSidebarButton.setAttribute("aria-expanded", "false");

openSidebarButton.addEventListener("click", openSidebar);
closeSidebarButton.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeSidebar();
  }
});

/* =================================
   INITIALISATION
================================= */

createConversation();
