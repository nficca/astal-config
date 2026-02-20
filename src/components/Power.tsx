import { Gtk } from "ags/gtk4";
import AstalIO from "gi://AstalIO?version=0.1";

export function Power() {
    return (
        <menubutton class="power bar-segment highlight">
            <image iconName="system-shutdown-symbolic" />
            <PowerPopover />
        </menubutton>
    );
}

function PowerPopover() {
    return (
        <popover hasArrow={false} autohide={true}>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                <PowerPopoverItem label="Lock" exec="hyprlock" />
                <PowerPopoverItem label="Logout" exec="niri msg action quit" />
                <PowerPopoverItem label="Suspend" exec="systemctl suspend" />
                <PowerPopoverItem label="Reboot" exec="systemctl reboot" />
                <PowerPopoverItem label="Shutdown" exec="systemctl poweroff" />
            </box>
        </popover>
    );
}

type PowerPopoverItemProps = {
    label: string;
    exec: string;
};

function PowerPopoverItem({ label, exec }: PowerPopoverItemProps) {
    return (
        <button onClicked={() => AstalIO.Process.exec_async(exec, null)}>
            <label label={label} halign={Gtk.Align.START} />
        </button>
    );
}
