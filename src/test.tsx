import { Astal, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { createState, For } from "gnim";
import GLib from "gi://GLib";

const { TOP, RIGHT } = Astal.WindowAnchor;

function TestPopup() {
    const [items, setItems] = createState<string[]>([]);

    let counter = 0;

    // Auto-add one item after 500ms (not triggered by user)
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        setItems(prev => [...prev, `Item ${counter++}`]);
        return false; // one-shot
    });

    return (
        <box orientation={Gtk.Orientation.VERTICAL}>
            <label label="Header" css="background: green;" />
            <For each={items}>
                {item => (
                    <button
                        css="background: white"
                        onClicked={() =>
                            setItems(prev => prev.filter(i => i !== item))
                        }
                    >
                        <label label={item} />
                    </button>
                )}
            </For>
        </box>
    );
}

app.start({
    main() {
        return (
            <window
                visible
                application={app}
                anchor={TOP | RIGHT}
                css="background: transparent;"
            >
                <TestPopup />
            </window>
        );
    },
});
