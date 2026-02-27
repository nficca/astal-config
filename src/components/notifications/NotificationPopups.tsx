import Notifd from "gi://AstalNotifd";
import {
    createBinding,
    createEffect,
    createMemo,
    createState,
    For,
    onCleanup,
} from "gnim";
import { Notification } from "./Notification";
import { Gtk } from "ags/gtk4";
import { TickTimer } from "@/src/utils/timer";

const DEFAULT_EXPIRY_TIME_MS = 5000;

const notifd = Notifd.get_default();

type ExpiringNotification = {
    notification: Notifd.Notification;
    timer: TickTimer;
};

export interface NotificationPopupsProps {
    window: Gtk.Window;
    expiryTimeMs: number;
}

export function NotificationPopups({
    window,
    expiryTimeMs = DEFAULT_EXPIRY_TIME_MS,
}: NotificationPopupsProps): Gtk.Box {
    const [notifications, setNotifications] = createState(
        new Map<number, ExpiringNotification>(),
    );
    const dontDisturb = createBinding(notifd, "dontDisturb");
    const isEmpty = createMemo(() => notifications().size === 0);

    const insertNotification = (notification: Notifd.Notification) => {
        const timer = new TickTimer(expiryTimeMs, window, () => {
            removeNotification(notification.id);
        });

        setNotifications(prev => {
            const existing = prev.get(notification.id);
            existing?.timer.stop();

            const next = new Map(prev);
            next.set(notification.id, { notification, timer });
            return next;
        });

        timer.start();
    };

    const removeNotification = (id: number) => {
        setNotifications(prev => {
            const existing = prev.get(id);
            existing?.timer.stop();

            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    };

    const notifiedHandler = notifd.connect(
        "notified",
        (_notifd, id, _replaced) => {
            const notification = notifd.get_notification(id);
            if (!notification || dontDisturb()) return;

            insertNotification(notification);
        },
    );

    const resolvedHandler = notifd.connect("resolved", (_notifd, id, _reason) =>
        removeNotification(id),
    );

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

        if (empty) {
            window.hide();
        } else {
            window.show();
        }
    });

    onCleanup(() => {
        notifd.disconnect(notifiedHandler);
        notifd.disconnect(resolvedHandler);
    });

    return (
        <box
            class="notification-popups"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={4}
        >
            <For each={notifications}>
                {([_id, notification]) => (
                    <Notification
                        notification={notification.notification}
                        onEnter={() => {
                            notification.timer.pause();
                        }}
                        onLeave={() => {
                            notification.timer.start();
                        }}
                    />
                )}
            </For>
        </box>
    ) as Gtk.Box;
}
