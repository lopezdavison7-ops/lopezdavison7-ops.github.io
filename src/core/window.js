import * as auth from "../auth/index.js";
import * as bots from "../bots/index.js";
import * as repository from "../repository/index.js";
import * as terminal from "../console/index.js";
import { showSection } from "./router.js";

export async function registerWindowAPI() {
    console.log("Entró a registerWindowAPI");
    alert("5. Entró a registerWindowAPI");

    // Auth
    window.showLogin = auth.showLogin;
    window.showRegister = auth.showRegister;
    window.register = auth.register;
    window.login = auth.login;
    window.logout = auth.logout;
    window.deleteAccount = auth.deleteAccount;

    // Router
    window.showSection = showSection;

    // Repository
    window.loadRepositories = repository.loadRepositories;
    window.updateRepository = repository.updateRepository;
    window.openRepositoryFile = repository.openRepositoryFile;
    window.closeCodeViewer = repository.closeCodeViewer;
    window.showRepoTab = repository.showRepoTab;

    // Bots
    window.deleteBot = bots.deleteBot;
    window.deployBot = bots.deployBot;
    window.toggleBot = bots.toggleBot;
    window.openConsole = bots.openConsole;

    // Console
    window.sendCommand = terminal.sendCommand;
    window.runCommand = terminal.runCommand;

    console.log("login registrada");
    alert("6. login registrada");
}