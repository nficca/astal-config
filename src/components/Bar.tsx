import Gdk from "gi://Gdk?version=4.0";

export type BarProps = {
    monitor: Gdk.Monitor;
};

export function Bar({ monitor }: BarProps) {
    return (
        <box>
            <label label={`Using monitor: ${monitor}`} />
            <button label="Click me!" />
        </box>
    );
}
