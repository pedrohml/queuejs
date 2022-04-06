import { Routes } from "@nestjs/core"
import { GroupsModule } from "./groups/groups.module";
import { TopicsModule } from "./topics/topics.module";

let routes: Routes = [
    {
        path: 'api',
        children: [
            {
                path: 'topics',
                module: TopicsModule
            },
            {
                path: 'groups',
                module: GroupsModule
            }
        ]
    }
];

export default routes;