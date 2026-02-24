import Notifd from "gi://AstalNotifd";
import Pango from "gi://Pango";
import { Gtk } from "ags/gtk4";
import { createBinding, createMemo, For } from "gnim";

export function getUrgencyClass(notification: Notifd.Notification): string {
    switch (notification.urgency) {
        case Notifd.Urgency.LOW:
            return "urgency-low";
        case Notifd.Urgency.CRITICAL:
            return "urgency-critical";
        default:
            return "urgency-normal";
    }
}

interface NotificationProps {
    notification: Notifd.Notification;
}

export function Notification({ notification }: NotificationProps) {
    const iconName = notification.appIcon || "dialog-information-symbolic";

    return (
        <box
            class="notification"
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={16}
        >
            <image
                class="icon"
                iconName={iconName}
                pixelSize={48}
                halign={Gtk.Align.START}
                valign={Gtk.Align.START}
            />
            <box orientation={Gtk.Orientation.VERTICAL} spacing={16}>
                <overlay>
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={8}
                        hexpand
                    >
                        <label
                            label={notification.summary}
                            class="summary"
                            halign={Gtk.Align.START}
                            wrap
                            wrapMode={Pango.WrapMode.WORD_CHAR}
                            maxWidthChars={50}
                            xalign={0}
                        />
                        {notification.body && (
                            <label
                                class="body"
                                label={notification.body}
                                halign={Gtk.Align.START}
                                wrap
                                wrapMode={Pango.WrapMode.WORD_CHAR}
                                maxWidthChars={50}
                                xalign={0}
                            />
                        )}
                    </box>
                    <button
                        $type="overlay"
                        class="dismiss"
                        halign={Gtk.Align.END}
                        valign={Gtk.Align.START}
                        onClicked={() => notification.dismiss()}
                    >
                        <image
                            iconName="window-close-symbolic"
                            pixelSize={16}
                        />
                    </button>
                </overlay>
                <NotificationActionButtons notification={notification} />
            </box>
        </box>
    );
}

type NotificationActionButtonsProps = {
    notification: Notifd.Notification;
};

function NotificationActionButtons({
    notification,
}: NotificationActionButtonsProps) {
    const rawActions = createBinding(notification, "actions");
    const actions = rawActions.as(actions =>
        actions.filter(action => action.id !== "default"),
    );
    const noActions = createMemo(() => actions().length === 0);

    if (noActions()) {
        return <></>;
    }

    return (
        <box class="actions" spacing={8}>
            <For each={actions}>
                {action => (
                    <button
                        class="action"
                        onClicked={() => notification.invoke(action.id)}
                    >
                        <label label={action.label} />
                    </button>
                )}
            </For>
        </box>
    );
}
