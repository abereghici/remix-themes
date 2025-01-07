import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"),
    route("action/set-theme", "./routes/action.set-theme.ts"),
    route("about", "./routes/about.tsx"),
] satisfies RouteConfig;
