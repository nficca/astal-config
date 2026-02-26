import { Gdk } from "ags/gtk4";
import AstalNiri from "gi://AstalNiri?version=0.1";
import Gtk from "gi://Gtk?version=4.0";
import { createBinding, createMemo, For, With } from "gnim";
import * as Applications from "../services/applications";
const niri = AstalNiri.get_default();

export type NiriWorkspacesProps = {
    monitor: Gdk.Monitor;
};

export function NiriWorkspaces({ monitor }: NiriWorkspacesProps) {
    const output = createBinding(niri, "outputs").as(outputs =>
        outputs.find(output => output.model === monitor.model),
    );

    return (
        <box>
            <With value={output}>
                {value => value && <Workspaces output={value} />}
            </With>
        </box>
    );
}

type WorkspacesProps = {
    output: AstalNiri.Output;
};

function Workspaces({ output }: WorkspacesProps) {
    const workspaces = createBinding(output, "workspaces").as(workspaces =>
        workspaces.sort((a, b) => a.idx - b.idx),
    );

    return (
        <box class="workspaces" spacing={4}>
            <For each={workspaces}>
                {workspace => <Workspace workspace={workspace} />}
            </For>
        </box>
    );
}

type WorkspaceProps = {
    workspace: AstalNiri.Workspace;
};

function Workspace({ workspace }: WorkspaceProps) {
    const windows = createBinding(workspace, "windows").as(windows => {
        const seen = new Set<string>();
        return windows.filter(w => {
            if (seen.has(w.app_id)) return false;
            seen.add(w.app_id);
            return true;
        });
    });
    const isActive = createBinding(workspace, "is_active");
    const isEmpty = createMemo(() => windows().length === 0);
    const cssClasses = createMemo(() => {
        const classes = ["bar-segment"];
        if (isActive()) classes.push("highlight");
        return classes;
    });

    return (
        <button
            cssClasses={cssClasses}
            onClicked={() => workspace.focus()}
            onRealize={btn => btn.set_cursor_from_name("pointer")}
        >
            <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                <image
                    visible={isEmpty}
                    icon_name="list-add-symbolic"
                    pixel_size={16}
                />
                <box visible={createMemo(() => !isEmpty())}>
                    <For each={windows}>
                        {window => <WorkspaceWindow window={window} />}
                    </For>
                </box>
            </box>
        </button>
    );
}

type WorkspaceWindowProps = {
    window: AstalNiri.Window;
};

function WorkspaceWindow({ window }: WorkspaceWindowProps) {
    const app = createBinding(window, "app_id").as(id => Applications.find(id));

    return (
        <box>
            <With value={app}>
                {app =>
                    app && <image icon_name={app.icon_name} pixel_size={24} />
                }
            </With>
        </box>
    );
}
