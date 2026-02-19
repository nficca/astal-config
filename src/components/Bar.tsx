import { NiriWorkspaces } from "./NiriWorkspaces";
import { DateTime } from "./DateTime";
import { Audio } from "./Audio";
import { Gdk, Gtk } from "ags/gtk4";

export type BarProps = {
    monitor: Gdk.Monitor;
};

export function Bar({ monitor }: BarProps) {
    return (
        <centerbox orientation={Gtk.Orientation.HORIZONTAL}>
            <NiriWorkspaces $type="start" monitor={monitor} />
            <box $type="end">
                <Audio scroll_step={5} />
                <DateTime />
            </box>
        </centerbox>
    );
}
