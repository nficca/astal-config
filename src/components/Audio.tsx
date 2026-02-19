import AstalWp from "gi://AstalWp?version=0.1";
import Pango from "gi://Pango?version=1.0";
import { Gtk } from "ags/gtk4";
import { Accessor, createBinding, createComputed, For } from "gnim";

const wp = AstalWp.get_default();

export type AudioProps = {
    scroll_step?: number;
};

export function Audio({ scroll_step }: AudioProps) {
    scroll_step = scroll_step ?? 2;

    if (!wp) {
        console.warn(
            "Can't create audio component - no default Wireplumber object",
        );
        return null;
    }

    const audio = wp.audio;
    const speaker = audio.defaultSpeaker;
    const volume = createBinding(speaker, "volume");
    const mute = createBinding(speaker, "mute");
    const speakers = createBinding(audio, "speakers");
    const description = createBinding(speaker, "description")(d => d || "");

    const volumeText = createComputed(() => {
        if (mute()) return "muted";
        return `${Math.round(volume() * 100)}%`;
    });

    const volumeIcon = createComputed(() => {
        if (mute()) return "audio-volume-muted-symbolic";
        const vol = volume();
        if (vol > 0.66) return "audio-volume-high-symbolic";
        if (vol > 0.33) return "audio-volume-medium-symbolic";
        return "audio-volume-low-symbolic";
    });

    const setup = (self: Gtk.Widget) => {
        const scrollController = new Gtk.EventControllerScroll();
        scrollController.set_flags(Gtk.EventControllerScrollFlags.VERTICAL);
        scrollController.connect("scroll", (_ctrl, _dx, dy) => {
            const current = Math.trunc(speaker.volume * 100);
            const delta = dy < 0 ? scroll_step : -scroll_step;
            const round = dy < 0 ? ceil_to_multiple : floor_to_multiple;
            const next = round(current + delta, scroll_step) / 100;
            speaker.set_volume(Math.max(0, Math.min(1, next)));
        });
        self.add_controller(scrollController);
    };

    return (
        <menubutton class="audio" $={setup}>
            <box spacing={4}>
                <image iconName={volumeIcon} />
                <label label={volumeText} />
            </box>
            <AudioPopover
                volumeIcon={volumeIcon}
                volume={volume}
                speakers={speakers}
                description={description}
                onVolumeChange={v => speaker.set_volume(v)}
            />
        </menubutton>
    );
}

interface AudioPopoverProps {
    volumeIcon: Accessor<string>;
    volume: Accessor<number>;
    speakers: Accessor<AstalWp.Endpoint[]>;
    description: Accessor<string>;
    onVolumeChange: (value: number) => void;
}

function AudioPopover({
    volumeIcon,
    volume,
    speakers,
    description,
    onVolumeChange,
}: AudioPopoverProps) {
    return (
        <popover hasArrow={false} autohide={true}>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                <box spacing={8}>
                    <image iconName={volumeIcon} />
                    <slider
                        hexpand
                        widthRequest={150}
                        value={volume}
                        onChangeValue={({ value }) => onVolumeChange(value)}
                    />
                </box>
                <AudioOutputSelector
                    speakers={speakers}
                    description={description}
                />
            </box>
        </popover>
    );
}

interface AudioOutputSelectorProps {
    speakers: Accessor<AstalWp.Endpoint[]>;
    description: Accessor<string>;
}

function AudioOutputSelector({
    speakers,
    description,
}: AudioOutputSelectorProps) {
    return (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
            <label label="Output" halign={Gtk.Align.START} />
            <menubutton>
                <box hexpand>
                    <label
                        label={description}
                        hexpand
                        halign={Gtk.Align.START}
                        ellipsize={Pango.EllipsizeMode.END}
                    />
                    <image iconName="pan-down-symbolic" />
                </box>
                <AudioOutputSelectorPopover speakers={speakers} />
            </menubutton>
        </box>
    );
}

interface AudioOutputSelectorPopoverProps {
    speakers: Accessor<AstalWp.Endpoint[]>;
}

function AudioOutputSelectorPopover({
    speakers,
}: AudioOutputSelectorPopoverProps) {
    return (
        <popover hasArrow={false}>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                <For each={speakers}>
                    {spk => {
                        const cssClasses = createBinding(spk, "is_default").as(
                            d => (d ? ["active"] : []),
                        );

                        return (
                            <button
                                cssClasses={cssClasses}
                                onClicked={() => spk.set_is_default(true)}
                            >
                                <label
                                    label={spk.description}
                                    halign={Gtk.Align.START}
                                />
                            </button>
                        );
                    }}
                </For>
            </box>
        </popover>
    );
}

function ceil_to_multiple(value: number, multiple: number): number {
    const rem = value % multiple;
    if (rem === 0) {
        return value;
    }

    return value + multiple - rem;
}

function floor_to_multiple(value: number, multiple: number): number {
    const rem = value % multiple;
    if (rem === 0) {
        return value;
    }

    return value - rem;
}
