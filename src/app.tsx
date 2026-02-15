import app from "ags/gtk4/app";
import { Astal } from "ags/gtk4";
import { Bar } from "./components/Bar";
import { createBinding, For, This } from "gnim";

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

app.start({
    main() {
        const monitors = createBinding(app, "monitors");

        return (
            <For each={monitors}>
                {monitor => (
                    <This this={app}>
                        <window
                            visible
                            gdkmonitor={monitor}
                            anchor={TOP | LEFT | RIGHT}
                            application={app}
                        >
                            <Bar monitor={monitor} />
                        </window>
                    </This>
                )}
            </For>
        );
    },
});
