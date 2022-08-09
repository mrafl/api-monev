import * as KnexModule from "knex";

export const knex = KnexModule.knex({
    client: process.env.DB_CLIENT,
    version: '8.0.11',
    connection: {
        host: process.env.DB_HOST,
        port: Number.parseInt(process.env.DB_PORT ?? ""),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }
});

// export const knex = (name: string) => {
//     const mod = KnexModule.knex({
//         client: process.env.DB_CLIENT,
//         version: '8.0.11',
//         connection: {
//             host: process.env.DB_HOST,
//             port: Number.parseInt(process.env.DB_PORT ?? ""),
//             user: process.env.DB_USER,
//             password: process.env.DB_PASS,
//             database: process.env.DB_NAME
//         }
//     });
//     return mod(name)
// }