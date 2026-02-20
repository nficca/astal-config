import { NiriWorkspaces } from "./NiriWorkspaces";
import { DateTime } from "./DateTime";
import { Audio } from "./Audio";
import { Power } from "./Power";
import { Gdk, Gtk } from "ags/gtk4";

export type BarProps = {
    monitor: Gdk.Monitor;
};

export function Bar({ monitor }: BarProps) {
    return (
        <centerbox class="bar" orientation={Gtk.Orientation.HORIZONTAL}>
            <box $type="start" spacing={8}>
                <NiriWorkspaces monitor={monitor} />
            </box>
            <box $type="end" spacing={8}>
                <Audio scroll_step={5} />
                <DateTime />
                <Power />
            </box>
        </centerbox>
    );
}
