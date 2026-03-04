import app from "ags/gtk4/app";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { Bar } from "./components/Bar";
import { NotificationPopups } from "./components/notifications";
import { createBinding, createEffect, jsx } from "gnim";
import style from "../assets/styles/index.scss";

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

/**
 * Get a stable identifier for a monitor that persists across reconnects.
 * Uses connector (e.g., "DP-1") as primary identifier.
 */
function getMonitorId(monitor: Gdk.Monitor): string {
    return monitor.connector ?? monitor.model ?? "unknown";
}

const windowsByMonitor = new Map<string, Gtk.Window[]>();

function createWindowsForMonitor(monitor: Gdk.Monitor): Gtk.Window[] {
    const monitorId = getMonitorId(monitor);

    if (windowsByMonitor.has(monitorId)) {
        return windowsByMonitor.get(monitorId)!;
    }

    const barWindow = new Astal.Window({
        visible: true,
        cssClasses: [],
        gdkmonitor: monitor,
        anchor: TOP | LEFT | RIGHT,
        application: app,
        exclusivity: Astal.Exclusivity.EXCLUSIVE,
    });
    barWindow.set_child(jsx(Bar, { monitor }) as Gtk.Widget);
    app.add_window(barWindow);

    const notifWindow = new Astal.Window({
        visible: true,
        cssClasses: [],
        gdkmonitor: monitor,
        anchor: TOP | RIGHT,
        application: app,
        layer: Astal.Layer.OVERLAY,
        exclusivity: Astal.Exclusivity.NORMAL,
    });
    notifWindow.set_child(
        jsx(NotificationPopups, { window: notifWindow }) as Gtk.Widget,
    );
    app.add_window(notifWindow);

    const windows = [barWindow, notifWindow];
    windowsByMonitor.set(monitorId, windows);
    return windows;
}

function destroyWindowsForMonitor(monitorId: string): void {
    const windows = windowsByMonitor.get(monitorId);
    if (windows) {
        for (const window of windows) {
            window.close();
        }
        windowsByMonitor.delete(monitorId);
    }
}

app.start({
    css: style,
    main() {
        const monitors = createBinding(app, "monitors");

        createEffect(
            () => {
                const currentMonitors = monitors();
                const currentIds = new Set(
                    [...currentMonitors].map(getMonitorId),
                );

                // Remove windows for disconnected monitors
                for (const [id] of windowsByMonitor) {
                    if (!currentIds.has(id)) {
                        destroyWindowsForMonitor(id);
                    }
                }

                // Create windows for new monitors
                for (const monitor of currentMonitors) {
                    createWindowsForMonitor(monitor);
                }
            },
            { immediate: true },
        );

        return null;
    },
});
