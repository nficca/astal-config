import Notifd from "gi://AstalNotifd";
import * as Applications from "../../services/applications";
import { exec, execAsync } from "ags/process";

const FALLBACK_ICON_NAME = "dialog-information-symbolic";

export type NotificationImage = {
    type: "icon" | "image";
    value: string;
};

export type NotificationImages = {
    primary: NotificationImage;
    secondary?: NotificationImage;
};

export function getNotificationImages(
    notification: Notifd.Notification,
): NotificationImages {
    const hint = notification.get_hint("image-path");
    const imagePath =
        hint?.get_type_string?.() === "s" ? hint.get_string()[0] : undefined;
    const iconName =
        notification.appIcon ||
        Applications.find(notification.appName)?.iconName;

    if (imagePath && iconName) {
        return {
            primary: toImage(imagePath),
            secondary: toImage(iconName),
        };
    }

    if (imagePath) {
        return { primary: toImage(imagePath) };
    }

    if (iconName) {
        return { primary: toImage(iconName) };
    }

    return { primary: { type: "icon", value: FALLBACK_ICON_NAME } };
}

function toImage(value: string): NotificationImage {
    if (!value.startsWith("/")) {
        return {
            type: "icon",
            value,
        };
    }

    try {
        exec(["bash", "-c", `[ -f "${value}" ]`]);

        return {
            type: "image",
            value,
        };
    } catch (error) {
        console.error(`Failed to resolve image path "${value}":`, error);
        return {
            type: "icon",
            value,
        };
    }
}
