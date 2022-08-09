import fs from "fs";
import * as uuid from 'uuid';
import {Buffer} from 'buffer';

export default class FileManager {

    static async createFolder(dir: string) {
        const folder = __dirname + `/../public/${dir}`
        if (!fs.existsSync(__dirname + "/../public/")) fs.mkdirSync(__dirname + "/../public/")
        if (!fs.existsSync(folder)) fs.mkdirSync(folder)
    }

    static async createFile(content: string, dir: string, ext: string) {
        const filename = uuid.v4() + "." + ext
        await this.createFolder(dir)
        const filedir = __dirname + "/../public/" + `${dir}/${filename}`
        fs.writeFileSync(filedir, Buffer.from(content, 'base64'))
        return `${dir}/${filename}`
    }
}