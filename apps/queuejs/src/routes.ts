import { Routes } from "@nestjs/core"
import { ConsumerModule } from "./modules/consumer.module";
import { ProducerModule } from "./modules/producer.module";

let routes: Routes = [
    {
        path: 'api',
        children: [
            {
                path: 'topics',
                module: ProducerModule
            },
            {
                path: 'groups',
                module: ConsumerModule
            }
        ]
    }
];

export default routes;