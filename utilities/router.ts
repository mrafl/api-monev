import {Express, Request} from "express"
import {error} from "./Utils";
import {knex} from "./knex";
import Constants from "./constants";
import Services from "./Services";
import AuthController from "../controllers/AuthController";
import AkunController from "../controllers/AkunController";

export interface RouteConfig {
    request: Request,
    user?: any,
    token?: string | null,
    mode?: number | null
}

export default class Router {
    private app: Express;

    private constructor(app: Express) {
        this.app = app;
    }

    static akunRouter(router: Router) {
        router.get("/akun", AkunController.index)
        router.post("/akun", AkunController.store)
        router.post("/akun/:id/edit", AkunController.update)
        router.post("/akun/:id/hapus", AkunController.destroy)
    }

    static route(app: Express) {
        const router = new Router(app)

        router.post("/masuk", AuthController.login)
        router.get("/logs", AuthController.userLogs, Constants.all)

        this.akunRouter(router)

    }

    private static async run(req: Request, action: (config: RouteConfig) => Promise<any>, mode?: any): Promise<any> {
        try {
            let user = null
            let token = null
            let pMode = null

            if (mode != null) {
                console.log("Parsing Auth")
                const auth = req.header("Authorization")
                if (auth == null) return error("Illegal Access!")

                const tokens = auth.split(":")
                if (tokens.length < 3) return error("Forbidden Access!")

                const payload = {
                    mode: Number.parseInt(tokens[0]),
                    identifier: tokens[1],
                    token: tokens[2]
                }

                if (mode instanceof Number && payload.mode != mode && mode != Constants.superadmin) return error("Forbidden Access")
                if (mode instanceof Array && !mode.includes(payload.mode) && !mode.includes(Constants.superadmin)) return error("Forbidden Access")

                console.log("Middleware Success")

                token = payload.token
                pMode = payload.mode
            }

            console.log("Executing Route")

            const result = await action({
                request: req,
                user: user,
                token: token,
                mode: pMode
            })

            console.log("Returning Result")
            return result
        } catch (e) {
            return error(e)
        }
    }

    get(pattern: string, action: (config: RouteConfig) => Promise<any>, mode?: any) {
        this.app.get(pattern, async (req, res) => {
            return res.status(200).json(await Router.run(req, action, mode))
        })
    }

    post(pattern: string, action: (config: RouteConfig) => Promise<any>, mode?: any) {
        this.app.post(pattern, async (req, res) => {
            return res.status(200).json(await Router.run(req, action, mode))
        })
    }
}