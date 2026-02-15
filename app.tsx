import app from "ags/gtk4/app"
import { Astal } from "ags/gtk4"
import { createPoll } from "ags/time"
import { createState, createComputed } from "ags"

app.start({
    main() {
        const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
        const clock = createPoll("", 1000, "date")

        return <Bar />
    },
})

function Bar() {
    return (
        <window visible>
            <box>
                Click the button.
                <LogButton buttonLabel="Click me!!" logMessage="I've been clicked!" />
            </box>
        </window>
    )
}

type LogButtonProps = {
    buttonLabel: string
    logMessage: string
}

function LogButton({ buttonLabel, logMessage }: LogButtonProps) {
    const [count, setCount] = createState(0)
    const countLabel = createComputed(() => `Count: ${count()}`)

    function onClicked() {
        console.log(logMessage)
        setCount((value) => value + 1)
    }

    return (
        <box>
            <label label={countLabel} />
            <button onClicked={onClicked}>
                <label label={buttonLabel} />
            </button>
        </box>
    )
}
