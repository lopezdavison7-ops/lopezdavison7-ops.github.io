import { consoleInput } from "./terminal.js";
import { sendCommand } from "./commands.js";

export function registerConsoleEvents() {
  consoleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendCommand();
    }
  });
}