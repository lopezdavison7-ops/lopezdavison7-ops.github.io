import { getBots } from "./state.js";

export function renderBots() {
  const container = document.getElementById('bots-list');
  container.innerHTML = getBots().map(bot => `
    <div class="bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-3xl p-6 transition">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-xl">${bot.name}</h3>
          <p class="text-gray-400">${bot.type}</p>
        </div>
        <span class="text-sm ${ bot.status.includes('Online') ? 'text-green-400' : 'text-yellow-400' }"> ${bot.status} </span>
      </div>
      <div class="mt-6 flex gap-3">
        <button onclick="toggleBot(${bot.id})" class="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700">Toggle</button>
        <button onclick="openConsole(${bot.id})" class="flex-1 py-3 rounded-2xl bg-gray-700 hover:bg-gray-600">Consola</button>
        <button onclick="deleteBot(${bot.id})" class="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700">Eliminar</button>
      </div>
    </div>
  `).join('');
}