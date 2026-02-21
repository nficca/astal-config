import Notifd from "gi://AstalNotifd";
import { Gtk } from "ags/gtk4";
import { Accessor, createBinding, createComputed, For } from "gnim";

const notifd = Notifd.get_default();

export function Notifications() {
    if (!notifd) {
        console.warn(
            "Can't create notifications component - no default Notifd object",
        );
        return <></>;
    }

    const notifications = createBinding(notifd, "notifications");
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
        <popover hasArrow={false} autohide={true}>
            <box
                class="notification-center"
                orientation={Gtk.Orientation.VERTICAL}
                spacing={12}
            >
                <box class="notification-header" spacing={8}>
                    <label
                        class="notification-title"
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
                    <button tooltipText="Clear all" onClicked={onClearAll}>
                        <image iconName="edit-clear-all-symbolic" />
                    </button>
                </box>
                <scrolledwindow
                    class="notification-list-scroll"
                    hscrollbarPolicy={Gtk.PolicyType.NEVER}
                    vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                    propagateNaturalHeight
                    maxContentHeight={400}
                    visible={hasNotifications}
                >
                    <box
                        class="notification-list"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={8}
                    >
                        <For each={notifications}>
                            {n => <NotificationItem notification={n} />}
                        </For>
                    </box>
                </scrolledwindow>
                <box
                    class="notification-empty"
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

interface NotificationItemProps {
    notification: Notifd.Notification;
}

function NotificationItem({ notification }: NotificationItemProps) {
    const urgencyClass = () => {
        switch (notification.urgency) {
            case Notifd.Urgency.LOW:
                return "urgency-low";
            case Notifd.Urgency.CRITICAL:
                return "urgency-critical";
            default:
                return "urgency-normal";
        }
    };

    const iconName = notification.appIcon || "dialog-information-symbolic";
    const actions = notification.actions;

    return (
        <box
            class={`notification-item ${urgencyClass()}`}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={8}
        >
            <box class="notification-content" spacing={8}>
                <image
                    class="notification-icon"
                    iconName={iconName}
                    valign={Gtk.Align.START}
                />
                <box orientation={Gtk.Orientation.VERTICAL} spacing={4} hexpand>
                    <label
                        class="notification-summary"
                        label={notification.summary}
                        halign={Gtk.Align.START}
                        wrap
                        xalign={0}
                    />
                    {notification.body && (
                        <label
                            class="notification-body"
                            label={notification.body}
                            halign={Gtk.Align.START}
                            wrap
                            xalign={0}
                        />
                    )}
                </box>
                <button
                    class="notification-dismiss"
                    valign={Gtk.Align.START}
                    onClicked={() => notification.dismiss()}
                >
                    <image iconName="window-close-symbolic" />
                </button>
            </box>
            {actions.length > 0 && (
                <box class="notification-actions" spacing={4}>
                    {actions.map(action => (
                        <button
                            class="notification-action"
                            hexpand
                            onClicked={() => notification.invoke(action.id)}
                        >
                            <label label={action.label} />
                        </button>
                    ))}
                </box>
            )}
        </box>
    );
}
