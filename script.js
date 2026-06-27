const consoleBox = document.getElementById("console");
const consoleInput = document.getElementById("consoleInput");

function logConsole(msg) {
  consoleBox.innerHTML += `<div>${msg}</div>`;
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

consoleInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = consoleInput.value.trim();
    runCommand(command);
    consoleInput.value = "";
  }
});

function runCommand(cmd) {
  const parts = cmd.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {

    case "clear":
    case "cls":
      consoleBox.innerHTML = "";
      break;

    case "help":
        logConsole(`Comandos disponibles:

help        - Muestra esta ayuda
bots        - Bots activos
clear, cls  - Limpia la consola
date        - Fecha y hora
time        - Hora actual`);
        break;

    case "bots":
        logConsole(`Bots activos: ${bots.length}`);
        break;

    case "date":
        logConsole(new Date().toLocaleString());
        break;

    case "time":
        logConsole(new Date().toLocaleTimeString());
        break;

    // otros comandos aquí...
  }
}
