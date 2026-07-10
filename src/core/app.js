import { bootstrap } from "./bootstrap.js";
import { registerWindowAPI } from "./window.js";

export async function startApplication() {

    console.log("startApplication");
    alert("2. startApplication");

    registerWindowAPI();

    console.log("window API registrada");
    alert("3. Window API registrada");

    await bootstrap();

    console.log("Bootstrap terminado");
    alert("4. Bootstrap terminado");

}