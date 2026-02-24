import Notifd from "gi://AstalNotifd";
import { Gtk } from "ags/gtk4";
import { Accessor, createBinding, createComputed, For } from "gnim";
import { getUrgencyClass, Notification } from "./shared";

const notifd = Notifd.get_default();

export function NotificationCenter() {
    if (!notifd) {
        console.warn(
            "Can't create notifications component - no default Notifd object",
        );
        return <></>;
    }

    const notifications = createBinding(notifd, "notifications").as(
        notifications => notifications.sort((a, b) => b.id - a.id),
    );
    const dontDisturb = createBinding(notifd, "dontDisturb");

    const iconName = createComputed(() => {
        if (dontDisturb()) return "notifications-disabled-symbolic";
        if (notifications().length > 0) return "notification-symbolic";
        return "notification-symbolic";
    });

    return (
        <menubutton class="notifications bar-segment">
            <image iconName={iconName} />
            <NotificationCenterPopover
                notifications={notifications}
                dontDisturb={dontDisturb}
            />
        </menubutton>
    );
}

interface NotificationCenterPopoverProps {
    notifications: Accessor<Notifd.Notification[]>;
    dontDisturb: Accessor<boolean>;
}

function NotificationCenterPopover({
    notifications,
    dontDisturb,
}: NotificationCenterPopoverProps) {
    const hasNotifications = createComputed(() => notifications().length > 0);

    const onDndToggle = ({ active }: { active: boolean }) => {
        notifd.dontDisturb = active;
        return false;
    };

    const onClearAll = () => {
        for (const n of notifications()) {
            n.dismiss();
        }
    };

    return (
        <popover class="notification-center" hasArrow={false} autohide={true}>
            <box
                class="main"
                orientation={Gtk.Orientation.VERTICAL}
                spacing={8}
            >
                <box spacing={4} class="header">
                    <label
                        label="Notifications"
                        hexpand
                        halign={Gtk.Align.START}
                    />
                    <switch
                        active={dontDisturb}
                        tooltipText="Do Not Disturb"
                        valign={Gtk.Align.CENTER}
                        onStateSet={onDndToggle}
                    />
                    <button
                        halign={Gtk.Align.END}
                        class="clear-all"
                        tooltipText="Clear all"
                        onClicked={onClearAll}
                    >
                        <image iconName="edit-clear-all-symbolic" />
                    </button>
                </box>
                <scrolledwindow
                    hscrollbarPolicy={Gtk.PolicyType.NEVER}
                    vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                    overlayScrolling={false}
                    propagateNaturalHeight
                    maxContentHeight={400}
                    visible={hasNotifications}
                >
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                        <For each={notifications}>
                            {notification => (
                                <Notification notification={notification} />
                            )}
                        </For>
                    </box>
                </scrolledwindow>
                <box
                    class="empty"
                    visible={createComputed(() => !hasNotifications())}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                >
                    <label label="No notifications" />
                </box>
            </box>
        </popover>
    );
}
