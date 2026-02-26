import Notifd from "gi://AstalNotifd";
import { createEffect, createMemo, createState, For } from "gnim";
import { Notification } from "./Notification";
import { Gtk } from "ags/gtk4";

const notifd = Notifd.get_default();

export function NotificationPopups() {
    let root: Gtk.Root | null;

    const [notifications, setNotifications] = createState(
        new Map<number, Notifd.Notification>(),
    );

    const isEmpty = createMemo(() => notifications().size === 0);

    notifd.connect("notified", (_notifd, id, _replaced) => {
        const notification = notifd.get_notification(id);

        if (!notification) return;

        setNotifications(prev => {
            const next = new Map(prev);
            next.set(id, notification);
            return next;
        });
    });

    notifd.connect("resolved", (_notifd, id, _reason) => {
        setNotifications(prev => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    });

    // When going from 1->0 notifications, Gtk does not always clear the screen
    // to remove the last notification. This appears to be a bug in Wayland when
    // the root window is transparent and the last visible object inside is
    // hidden or removed.
    //
    // The (hacky) fix here is too just hide the window whenever we go from
    // having one or more notifications to having zero, and showing the window
    // in the opposite case.
    createEffect(() => {
        const empty = isEmpty();

        if (!root) return;

        if (empty) {
            root.hide();
        } else {
            root.show();
        }
    });

    return (
        <box
            class="notification-popups"
            orientation={Gtk.Orientation.VERTICAL}
            onRealize={self => {
                root = self.get_root();
            }}
            spacing={4}
        >
            <For each={notifications}>
                {([_id, notification]) => (
                    <Notification notification={notification} />
                )}
            </For>
        </box>
    );
}
