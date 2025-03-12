if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then(() => console.log("Service Worker registrado exitosamente."))
        .catch((error) => console.log("Error al registrar el Service Worker:", error));
}
