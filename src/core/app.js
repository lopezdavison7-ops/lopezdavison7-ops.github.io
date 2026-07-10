import { bootstrap } from "./bootstrap.js";
import { registerWindowAPI } from "./window.js";

export async function startApplication() {

    console.log("startApplication");

    registerWindowAPI();

    console.log("window API registrada");
    
    await bootstrap();

}