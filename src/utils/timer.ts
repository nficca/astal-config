import { Gtk } from "ags/gtk4";

/**
 * A pausable timer that executes a callback when it finishes.
 *
 * The timer requires a host widget to attach itself to. This is because the the
 * timer will tick with each frame update of that widget, making it suitable as
 * a timer for systems that affect UI.
 */
export class TickTimer {
    private interval: number;
    private remaining: number;
    private host: Gtk.Widget;
    private callback: () => void;
    private tickId: number | null = null;
    private lastFrameTime: number = 0;

    /**
     * @param {number} milliseconds
     *
     * The time in milliseconds that the timer must run before finishing and
     * calling the callback.
     *
     * @param {Gtk.Widget} hostWidget
     *
     * The widget whose frame updates the timer will be tied to.
     *
     * @param {() => void} callback
     *
     * The callback to run after the timer finishes.
     */
    constructor(
        milliseconds: number,
        hostWidget: Gtk.Widget,
        callback: () => void,
    ) {
        this.interval = milliseconds * 1000;
        this.remaining = this.interval;
        this.host = hostWidget;
        this.callback = callback;
    }

    /**
     * Starts the timer.
     *
     * If the timer was previously paused, this effectively unpauses it.
     */
    public start() {
        this.stop();
        this.lastFrameTime = 0;

        this.tickId = this.host.add_tick_callback((_host, frameClock) => {
            const currentFrameTime = frameClock.get_frame_time();

            if (this.lastFrameTime === 0) {
                this.lastFrameTime = currentFrameTime;
                return true;
            }

            const delta = currentFrameTime - this.lastFrameTime;

            this.remaining = Math.max(0, this.remaining - delta);
            this.lastFrameTime = currentFrameTime;

            if (this.remaining <= 0) {
                this.callback();
                this.stop();
                return false;
            }

            return true;
        });
    }

    /**
     * Reset the timer and stops it if it was running.
     */
    public reset() {
        this.remaining = this.interval;
        this.stop();
    }

    /**
     * Pauses the timer.
     *
     * This is effectively an alias for {@link stop}.
     */
    public pause() {
        this.stop();
    }

    /**
     * Resumes the timer.
     *
     * This is effectively an alias for {@link start}.
     */
    public resume() {
        this.start();
    }

    /**
     * Stop the timer.
     *
     * This stops the timer from updating, but it does not reset the remaining
     * time.
     */
    public stop() {
        if (this.tickId !== null) {
            this.host.remove_tick_callback(this.tickId);
            this.tickId = null;
        }
    }
}
