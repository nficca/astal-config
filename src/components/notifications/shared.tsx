import Notifd from "gi://AstalNotifd";
import Pango from "gi://Pango";
import { Gtk } from "ags/gtk4";
import { createBinding, createMemo, For } from "gnim";
import * as Applications from "../../services/applications";
import GdkPixbuf from "gi://GdkPixbuf";
import Gdk from "gi://Gdk?version=4.0";

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
    const iconName = findNotificationIconName(notification);
    const imagePath = notification.get_hint("image-path")?.get_string()[0];

    return (
        <box
            class="notification"
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={16}
        >
            {imagePath && imagePath !== iconName ? (
                <overlay halign={Gtk.Align.START} valign={Gtk.Align.START}>
                    <image
                        paintable={Gdk.Texture.new_for_pixbuf(
                            GdkPixbuf.Pixbuf.new_from_file_at_scale(
                                imagePath,
                                48,
                                -1,
                                true,
                            ),
                        )}
                        pixelSize={48}
                    />
                    <image
                        $type="overlay"
                        iconName={iconName}
                        pixelSize={24}
                        halign={Gtk.Align.END}
                        valign={Gtk.Align.END}
                    />
                </overlay>
            ) : (
                <image
                    class="icon"
                    iconName={iconName}
                    pixelSize={48}
                    halign={Gtk.Align.START}
                    valign={Gtk.Align.START}
                />
            )}
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

function findNotificationIconName(notification: Notifd.Notification): string {
    if (notification.appIcon) return notification.appIcon;

    const appIconFromName = Applications.find(notification.app_name)?.icon_name;
    if (appIconFromName) return appIconFromName;

    const imagePath = notification.get_hint("image-path")?.get_string()[0];
    if (imagePath) return imagePath;

    return "dialog-information-symbolic";
}
