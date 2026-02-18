import app from "ags/gtk4/app";
import { Astal } from "ags/gtk4";
import { Bar } from "./components/Bar";
import { createBinding, For, This } from "gnim";
import style from "../assets/styles/index.scss";

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

app.start({
    css: style,
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
                            exclusivity={Astal.Exclusivity.EXCLUSIVE}
                        >
                            <Bar monitor={monitor} />
                        </window>
                    </This>
                )}
            </For>
        );
    },
});
