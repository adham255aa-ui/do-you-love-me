(() => {
  "use strict";

  const questionScreen = document.getElementById("questionScreen");
  const surpriseScreen = document.getElementById("surpriseScreen");
  const reactionMessage = document.getElementById("reactionMessage");
  const buttonStage = document.getElementById("buttonStage");
  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");
  const extraSurpriseButton = document.getElementById("extraSurpriseButton");
  const extraMessage = document.getElementById("extraMessage");
  const restartButton = document.getElementById("restartButton");
  const heartsBackground = document.getElementById("heartsBackground");
  const celebration = document.getElementById("celebration");

  const messages = [
    "Are you sure? 🥺",
    "Think about it again! 😭",
    "My little heart can’t take this 💔😂",
    "Okay, okay… try again 😂❤️",
    "Is the button running away from the truth? 🏃‍♀️💨",
    "Last chance… probably 😌💗"
  ];
  let attempts = 0;
  let yesScale = 1;
  let noScale = 1;
  let pointerMoveHandler = null;

  function makeFloatingHeart() {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = ["💗", "💕", "💖", "❤️", "💘"][Math.floor(Math.random() * 5)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${14 + Math.random() * 24}px`;
    heart.style.animationDuration = `${6 + Math.random() * 6}s`;
    heartsBackground.appendChild(heart);
    window.setTimeout(() => heart.remove(), 12500);
  }
  for (let i = 0; i < 14; i++) {
    window.setTimeout(makeFloatingHeart, i * 250);
  }
  window.setInterval(makeFloatingHeart, 650);

  function updateMessage() {
    reactionMessage.textContent = messages[Math.min(attempts, messages.length - 1)];
  }

  function boxesOverlap(a, b, gap = 10) {
    return !(a.right + gap < b.left || a.left > b.right + gap ||
             a.bottom + gap < b.top || a.top > b.bottom + gap);
  }

  function moveButton(button) {
    const stageRect = buttonStage.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const padding = 4;
    const maxX = Math.max(padding, stageRect.width - buttonRect.width - padding);
    const maxY = Math.max(padding, stageRect.height - buttonRect.height - padding);
    const other = button === yesButton ? noButton : yesButton;

    // Convert the fleeing button to absolute positioning within its stage.
    button.style.position = "absolute";
    button.style.margin = "0";
    button.style.zIndex = button === yesButton ? "3" : "2";

    const otherRect = other.getBoundingClientRect();
    let chosen = null;
    for (let i = 0; i < 40; i++) {
      const x = padding + Math.random() * Math.max(0, maxX - padding);
      const y = padding + Math.random() * Math.max(0, maxY - padding);
      const candidate = {
        left: stageRect.left + x, top: stageRect.top + y,
        right: stageRect.left + x + buttonRect.width,
        bottom: stageRect.top + y + buttonRect.height
      };
      if (!boxesOverlap(candidate, otherRect, 8)) {
        chosen = { x, y };
        break;
      }
    }
    if (!chosen) {
      // If the stage is too small to find a non-overlapping location, expand it.
      buttonStage.style.minHeight = `${Math.max(120, buttonRect.height + 24)}px`;
      const refreshed = buttonStage.getBoundingClientRect();
      chosen = { x: Math.max(padding, Math.min(maxX, refreshed.width - buttonRect.width - padding)), y: padding };
    }
    button.style.left = `${chosen.x}px`;
    button.style.top = `${chosen.y}px`;
  }

  function handleAttempt(event) {
    if (event && event.type === "pointerdown" && event.pointerType === "mouse" && event.button !== 0) return;
    attempts++;
    updateMessage();

    // Gradually make the positive answer larger and easier to hit.
    yesScale = Math.min(1.65, 1 + attempts * 0.075);
    yesButton.style.transform = `scale(${yesScale})`;
    yesButton.style.zIndex = "4";
    noScale = Math.max(0.72, 1 - attempts * 0.035);
    noButton.style.transform = `scale(${noScale})`;

    // On touch devices the button moves on pointerdown; on desktop it also reacts to hover.
    moveButton(event.currentTarget);
  }

  [yesButton, noButton].forEach((button) => {
    button.addEventListener("pointerdown", handleAttempt);
    button.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") handleAttempt({ currentTarget: button, type: "pointerenter" });
    });
    button.addEventListener("click", (event) => {
      // A successful click on Yes should always win; No continues the game.
      if (button === yesButton) showSurprise();
      else {
        event.preventDefault();
        attempts++;
        updateMessage();
        moveButton(noButton);
      }
    });
  });

  // Keep the buttons within their stage after viewport changes.
  window.addEventListener("resize", () => {
    [yesButton, noButton].forEach((button) => {
      if (button.style.position === "absolute") {
        const stageRect = buttonStage.getBoundingClientRect();
        const rect = button.getBoundingClientRect();
        const left = Math.max(4, Math.min(parseFloat(button.style.left) || 4, stageRect.width - rect.width - 4));
        const top = Math.max(4, Math.min(parseFloat(button.style.top) || 4, stageRect.height - rect.height - 4));
        button.style.left = `${left}px`;
        button.style.top = `${top}px`;
      }
    });
  });

  function launchCelebration() {
    celebration.replaceChildren();
    const icons = ["💖", "💗", "✨", "💕", "💘", "🌸"];
    for (let i = 0; i < 34; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.textContent = icons[Math.floor(Math.random() * icons.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 1.4}s`;
      piece.style.fontSize = `${14 + Math.random() * 17}px`;
      celebration.appendChild(piece);
    }
  }

  function showSurprise() {
    questionScreen.classList.add("hidden");
    surpriseScreen.classList.remove("hidden");
    extraMessage.classList.add("hidden");
    extraSurpriseButton.setAttribute("aria-expanded", "false");
    launchCelebration();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  extraSurpriseButton.addEventListener("click", () => {
    extraMessage.classList.toggle("hidden");
    const expanded = !extraMessage.classList.contains("hidden");
    extraSurpriseButton.setAttribute("aria-expanded", String(expanded));
    extraSurpriseButton.textContent = expanded ? "Hide the surprise 💗" : "Click here for another surprise 💌";
  });

  restartButton.addEventListener("click", () => {
    attempts = 0;
    yesScale = 1;
    noScale = 1;
    [yesButton, noButton].forEach((button) => {
      button.removeAttribute("style");
    });
    buttonStage.style.minHeight = "";
    reactionMessage.textContent = "Be honest with me... 🙈";
    surpriseScreen.classList.add("hidden");
    questionScreen.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Make the interaction usable with keyboard as well as touch and mouse.
  [yesButton, noButton].forEach((button) => {
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        if (button === yesButton) showSurprise();
        else {
          event.preventDefault();
          attempts++;
          updateMessage();
          moveButton(noButton);
        }
      }
    });
  });
})();
