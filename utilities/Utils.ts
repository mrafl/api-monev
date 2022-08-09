import * as crypto from "crypto";
import {knex} from "./knex";

export function now() {
    const now = new Date()
    now.setHours(now.getUTCHours() + 7)
    return now
}

export function tanggalExpired() {
    const tanggalExpired = new Date();
    tanggalExpired.setDate(tanggalExpired.getDate() + 14)
    return tanggalExpired
}

export function encrypt(data: string): string {
    return crypto.createHmac("sha256", process.env.APP_SECRET!!)
        .update(data)
        .digest("hex")
}

export function success(data?: any | null) {
    return {
        status: true,
        message: "",
        data: data
    }
}

export function error(message: any) {
    return {
        status: false,
        message: message,
        data: null
    }
}

export async function createLog(identifier: string, log: string) {
    await knex("user_logs").insert({
        identifier: identifier,
        log: log,
        createdAt: now()
    })
}