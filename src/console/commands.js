import { consoleInput, consoleBox } from "./terminal.js";
import { logConsole } from "./logger.js";

export function runCommand(cmd = "") {
  cmd = cmd.trim();
  if (!cmd) return;

  const parts = cmd.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {

    case "clear":
    case "cls":
      consoleBox.innerHTML = "";
      logConsole("BotHost Console v1.0");
      logConsole("Escribe 'help' para ver los comandos.");
      logConsole("/>");
      break;

    case "help":
        logConsole(`/> ${command}

Comandos disponibles:

help        - Muestra esta ayuda
bots        - Bots activos
clear, cls  - Limpia la consola
date        - Fecha y hora
time        - Hora actual`);
        logConsole("/>");
        break;

    case "bots":
        logConsole(`/> ${command}
            
Bots activos: ${bots.length}`);
        logConsole("/>");
        break;

    case "date":
        logConsole(`/> ${command}
            
Fecha y hora actual:`);
        logConsole(new Date().toLocaleString());
        logConsole("/>");
        break;

    case "time":
        logConsole(`/> ${command}

Hora actual:`);
        logConsole(new Date().toLocaleTimeString());
        logConsole("/>");
        break;

    // otros comandos aquí...
    
    default:
        logConsole(`'${command}' no es un comando válido.`);
        logConsole("Escribe 'help' para ver la lista.");
        logConsole("/>");
  }
}

export function sendCommand() {
    const input = document.getElementById("console-input");

    runCommand(input.value);

    input.value = "";
    input.focus();
}