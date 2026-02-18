import { NiriWorkspaces } from "./NiriWorkspaces";
import { DateTime } from "./DateTime";
import { Gdk, Gtk } from "ags/gtk4";

export type BarProps = {
    monitor: Gdk.Monitor;
};

export function Bar({ monitor }: BarProps) {
    return (
        <centerbox orientation={Gtk.Orientation.HORIZONTAL}>
            <NiriWorkspaces $type="start" monitor={monitor} />
            <DateTime $type="end" />
        </centerbox>
    );
}
