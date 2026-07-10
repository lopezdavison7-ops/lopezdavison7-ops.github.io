import { bootstrap } from "./bootstrap.js";
import { registerWindowAPI } from "./window.js";

export async function startApplication() {
    registerWindowAPI();

    await bootstrap();
}