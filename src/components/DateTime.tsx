import { createComputed } from "gnim";
import { createPoll } from "ags/time";
import GLib from "gi://GLib?version=2.0";

export function DateTime() {
    const datetime = createPoll(GLib.DateTime.new_now_local(), 1000, () =>
        GLib.DateTime.new_now_local(),
    );

    const formatted = createComputed(
        () => datetime().format("%a %b %d - %l:%M:%S %p")?.trim() ?? "",
    );

    return (
        <box class="datetime">
            <label label={formatted} />
        </box>
    );
}
