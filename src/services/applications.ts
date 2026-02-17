import AstalApps from "gi://AstalApps?version=0.1";

const Apps = new AstalApps.Apps();
const Cache: Map<string, AstalApps.Application> = new Map();

type AppId = string;

export function find(app_id: AppId): AstalApps.Application | undefined {
    if (Cache.has(app_id)) {
        return Cache.get(app_id);
    }

    for (const app of Apps.get_list()) {
        if (
            app.entry.toLowerCase() === app_id.toLowerCase() ||
            app.iconName === app_id ||
            app.name === app_id ||
            app.wm_class === app_id
        ) {
            Cache.set(app_id, app);
            return app;
        }
    }
}
