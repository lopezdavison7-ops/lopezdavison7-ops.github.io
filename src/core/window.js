import * as auth from "../auth/index.js";
import * as bots from "../bots/index.js";
import * as repository from "../repository/index.js";
import * as terminal from "../console/index.js";
import { showSection } from "./router.js";

export function registerWindowAPI() {
    window.showLogin = showLogin;
    window.showRegister = showRegister;
    window.register = register;
    window.login = login;
    window.logout = logout;
    window.showSection = showSection;
    window.loadRepositories = loadRepositories;
    window.updateRepository = updateRepository;
    window.openRepositoryFile = openRepositoryFile;
    window.closeCodeViewer = closeCodeViewer;
    window.deleteBot = deleteBot;
    window.deployBot = deployBot;
    window.toggleBot = toggleBot;
    window.showRepoTab = showRepoTab;
    window.openConsole = openConsole;
    window.sendCommand = sendCommand;
    window.runCommand = runCommand;
    window.deleteAccount = deleteAccount;
}