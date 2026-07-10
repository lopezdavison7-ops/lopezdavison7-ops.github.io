export function logConsole(msg) {
  const line = document.createElement("div");
  line.textContent = msg;
  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}