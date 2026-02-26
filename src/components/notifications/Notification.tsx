import Notifd from "gi://AstalNotifd";
import Pango from "gi://Pango";
import { Gtk } from "ags/gtk4";
import { createBinding, createMemo, For } from "gnim";
import GdkPixbuf from "gi://GdkPixbuf";
import Gdk from "gi://Gdk?version=4.0";
import { getNotificationImages, NotificationImage } from "./shared";
import GObject from "gnim/gobject";

export interface NotificationProps {
    notification: Notifd.Notification;
}

export function Notification({ notification }: NotificationProps) {
    return (
        <box
            class="notification"
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={16}
        >
            <Image notification={notification} />
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

interface ImageProps {
    notification: Notifd.Notification;
    pixelSize?: number;
    overlayIconPixelSize?: number;
}

function Image({
    notification,
    pixelSize = 48,
    overlayIconPixelSize = 24,
}: ImageProps) {
    const images = getNotificationImages(notification);

    const imageToGObject = (
        image: NotificationImage,
        pixelSize: number,
        isOverlayed = false,
    ): GObject.Object => {
        return image.type === "icon" ? (
            <image
                $type={isOverlayed ? "overlay" : undefined}
                pixelSize={pixelSize}
                iconName={image.value}
                halign={isOverlayed ? Gtk.Align.END : Gtk.Align.CENTER}
                valign={isOverlayed ? Gtk.Align.END : Gtk.Align.CENTER}
            />
        ) : (
            <image
                $type={isOverlayed ? "overlay" : undefined}
                pixelSize={pixelSize}
                paintable={Gdk.Texture.new_for_pixbuf(
                    // TODO: This has several issues that should be fixed:
                    //  - Blocking I/O call on the UI thread
                    //  - Crashes if the file doesn't exist
                    GdkPixbuf.Pixbuf.new_from_file_at_scale(
                        image.value,
                        pixelSize,
                        -1,
                        true,
                    ),
                )}
                halign={isOverlayed ? Gtk.Align.END : Gtk.Align.CENTER}
                valign={isOverlayed ? Gtk.Align.END : Gtk.Align.CENTER}
            />
        );
    };

    if (images.secondary) {
        return (
            <overlay halign={Gtk.Align.START} valign={Gtk.Align.START}>
                {imageToGObject(images.primary, pixelSize)}
                {imageToGObject(images.secondary, overlayIconPixelSize, true)}
            </overlay>
        );
    } else {
        return imageToGObject(images.primary, pixelSize);
    }
}

interface NotificationActionButtonsProps {
    notification: Notifd.Notification;
}

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
