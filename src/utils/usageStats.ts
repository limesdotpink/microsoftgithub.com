import Keyv from "keyv";
import KeyvFile from "keyv-file";

const keyv = new Keyv({
    store: new KeyvFile({
        filename: `./store.json`,
    }),
});

export async function getUsageStats(service: string) {
    return {
        users: (await keyv.get(`${service}-user`)) || 0,
        bots: (await keyv.get(`${service}-bot`)) || 0,
    };
}

export async function bumpStat(service: string, type: "user" | "bot") {
    const key = `${service}-${type}`;
    const s = (await keyv.get(key)) || 0;
    await keyv.set(key, s + 1);
}
