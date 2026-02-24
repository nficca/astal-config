import AstalTray from "gi://AstalTray?version=0.1";
import { Gdk, Gtk } from "ags/gtk4";
import { createBinding, For } from "gnim";

const tray = AstalTray.get_default();

export function Tray() {
    if (!tray) {
        console.warn("Can't create system tray - no default Tray object");
        return <></>;
    }

    const items = createBinding(tray, "items");

    return (
        <box class="tray bar-segment" spacing={2}>
            <For each={items}>{item => <TrayItem item={item} />}</For>
        </box>
    );
}

type TrayItemProps = {
    item: AstalTray.TrayItem;
};

function TrayItem({ item }: TrayItemProps) {
    const gicon = createBinding(item, "gicon");
    const tooltipMarkup = createBinding(item, "tooltipMarkup");

    const setup = (self: Gtk.Widget) => {
        const popover = Gtk.PopoverMenu.new_from_model(item.menu_model);
        popover.set_parent(self);
        popover.set_has_arrow(false);
        self.insert_action_group("dbusmenu", item.action_group);

        const showMenu = () => {
            if (!item.menu_model) return;
            item.about_to_show();
            popover.set_menu_model(item.menu_model);
            popover.popup();
        };

        const clickController = new Gtk.GestureClick();
        clickController.set_button(0);
        clickController.connect("pressed", (_ctrl, _n, x, y) => {
            const button = clickController.get_current_button();
            if (button === Gdk.BUTTON_PRIMARY) {
                if (item.is_menu) {
                    showMenu();
                } else {
                    item.activate(x, y);
                }
            } else if (button === Gdk.BUTTON_SECONDARY) {
                showMenu();
            } else if (button === Gdk.BUTTON_MIDDLE) {
                item.secondary_activate(x, y);
            }
        });
        self.add_controller(clickController);

        self.connect("destroy", () => {
            popover.popdown();
            popover.unparent();
            self.insert_action_group("dbusmenu", null);
        });
    };

    return (
        <button $={setup} tooltipMarkup={tooltipMarkup}>
            <image gicon={gicon} />
        </button>
    );
}
