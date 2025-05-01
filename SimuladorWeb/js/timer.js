// ---------- src/timer.js ----------
export class Timer {
  constructor(displayElement, duration, onTimeout) {
    this.display = displayElement;
    this.duration = duration;
    this.onTimeout = onTimeout;
    this.remainingTime = duration;
    this.intervalId = null;
    // Nueva propiedad para seguimiento
    this.isTimeout = false;
  }

  start() {
    this.isTimeout = false;
    this.intervalId = setInterval(() => {
      this.remainingTime--;
      this.display.textContent = this.remainingTime;

      if (this.remainingTime <= 0) {
        this.isTimeout = true;
        this.stop();
        this.onTimeout();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this.intervalId);
    if (this.isTimeout) {
      this.display.textContent = "00";
    }
  }

  reset() {
    this.stop();
    this.remainingTime = this.duration;
    this.display.textContent = this.duration;
    this.isTimeout = false;
  }
}
