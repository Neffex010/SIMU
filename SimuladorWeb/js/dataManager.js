// ---------- src/dataManager.js ----------
export class DataManager {
  constructor(storageKey = "datosAspirante") {
    this.storageKey = storageKey;
    this.datosAspirante = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.datosAspirante = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("LocalStorage corrupto, limpiando y redirigiendo.", e);
      localStorage.removeItem(this.storageKey);
      this.datosAspirante = null;
    }
    return this.datosAspirante;
  }

  requireDataOrRedirect(redirectUrl = "../index.html") {
    if (!this.load()) window.location.href = redirectUrl;
    return this.datosAspirante;
  }
}