import app from "ags/gtk4/app";
import { Bar } from "./components/Bar";

app.start({
    main() {
        return <Bar />;
    },
});
