import AstalWp from "gi://AstalWp?version=0.1";
import Pango from "gi://Pango?version=1.0";
import { Gtk } from "ags/gtk4";
import { Accessor, createBinding, createComputed, For } from "gnim";

const wp = AstalWp.get_default();

export function Audio() {
    const audio = wp?.audio;
    if (!audio) {
        return (
            <box class="audio">
                <label label="--%" />
            </box>
        );
    }

    const speaker = audio.defaultSpeaker;
    const volume = createBinding(speaker, "volume");
    const mute = createBinding(speaker, "mute");
    const speakers = createBinding(audio, "speakers");
    const description = createBinding(speaker, "description")((d) => d || "");

    const displayText = createComputed(() => {
        if (mute()) return "muted";
        return `${Math.round(volume() * 100)}%`;
    });

    const iconName = createComputed(() => {
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
            if (dy < 0) {
                speaker.set_volume(Math.min(1, speaker.volume + 0.02));
            } else {
                speaker.set_volume(Math.max(0, speaker.volume - 0.02));
            }
        });
        self.add_controller(scrollController);
    };

    return (
        <menubutton class="audio" $={setup}>
            <box spacing={4}>
                <image iconName={iconName} />
                <label label={displayText} />
            </box>
            <popover class="audio-popup" hasArrow={false} autohide={true}>
                <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                    <box class="audio-slider-box" spacing={8}>
                        <image iconName={iconName} />
                        <slider
                            hexpand
                            widthRequest={150}
                            value={volume}
                            onChangeValue={({ value }) => speaker.set_volume(value)}
                        />
                    </box>
                    <OutputSelector speakers={speakers} description={description} />
                </box>
            </popover>
        </menubutton>
    );
}

interface OutputSelectorProps {
    speakers: Accessor<AstalWp.Endpoint[]>;
    description: Accessor<string>;
}

function OutputSelector({ speakers, description }: OutputSelectorProps) {
    let popover: Gtk.Popover;

    return (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
            <label label="Output" halign={Gtk.Align.START} class="audio-output-label" />
            <button
                class="audio-output-selector"
                focusOnClick={false}
                onClicked={(self) => {
                    if (!popover.get_parent()) {
                        popover.set_parent(self);
                    }
                    popover.popup();
                }}
            >
                <box hexpand>
                    <label
                        label={description}
                        hexpand
                        halign={Gtk.Align.START}
                        ellipsize={Pango.EllipsizeMode.END}
                    />
                    <image iconName="pan-down-symbolic" />
                </box>
            </button>
            <popover
                class="audio-output-popover"
                hasArrow={false}
                $={(self) => (popover = self)}
            >
                <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                    <For each={speakers}>
                        {(spk) => (
                            <button
                                class={createBinding(spk, "is_default")((d) =>
                                    d ? "audio-output-item active" : "audio-output-item"
                                )}
                                onClicked={() => {
                                    spk.set_is_default(true);
                                    popover.popdown();
                                }}
                            >
                                <label
                                    label={spk.description}
                                    halign={Gtk.Align.START}
                                />
                            </button>
                        )}
                    </For>
                </box>
            </popover>
        </box>
    );
}
