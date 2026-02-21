import Notifd from "gi://AstalNotifd";
import { createBinding, createComputed } from "gnim";

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
            <popover hasArrow={false} autohide={true}>
                <box />
            </popover>
        </menubutton>
    );
}
