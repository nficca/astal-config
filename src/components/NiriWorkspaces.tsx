import { Gdk } from "ags/gtk4";
import AstalNiri from "gi://AstalNiri?version=0.1";
import { createBinding, createComputed, For, With } from "gnim";
import Applications from "../services/applications";

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
        <box class="workspaces" spacing={10}>
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
    const index = createBinding(workspace, "idx");
    const windows = createBinding(workspace, "windows");
    const visible = createComputed(() => windows().length > 0);

    return (
        <box class="workspace" visible={visible}>
            <With value={index}>
                {index => <label class="workspace-index" label={String(index)} />}
            </With>
            <box class="workspace-windows">
                <For each={windows}>
                    {window => <WorkspaceWindow window={window} />}
                </For>
            </box>
        </box>
    );
}

type WorkspaceWindowProps = {
    window: AstalNiri.Window;
};

function WorkspaceWindow({ window }: WorkspaceWindowProps) {
    const app = createBinding(window, "app_id").as(id =>
        Applications.fuzzy_query(id).at(0),
    );

    return (
        <box class="workspace-window">
            <With value={app}>
                {app => app && <image icon_name={app.icon_name} pixel_size={24} />}
            </With>
        </box>
    );
}
