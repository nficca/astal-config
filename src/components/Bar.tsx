import Gdk from "gi://Gdk?version=4.0";
import { NiriWorkspaces } from "./NiriWorkspaces";

export type BarProps = {
    monitor: Gdk.Monitor;
};

export function Bar({ monitor }: BarProps) {
    return (
        <box>
            <NiriWorkspaces monitor={monitor} />
        </box>
    );
}
