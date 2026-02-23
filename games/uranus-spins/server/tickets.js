import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const hmacSecret = process.env.HMAC_SECRET || "dev_secret";

function sign(payload) {
    const h = crypto.createHmac("sha256", hmacSecret);
    h.update(JSON.stringify(payload));
    return h.digest("hex");
}

export function createTicket(payload) {
    const ticket = {
        id: uuidv4(),
        ...payload,
        createdAt: Date.now()
    };
    ticket.signature = sign(ticket);
    return ticket;
}

export function verifyTicket(ticket) {
    const { signature } = ticket;
    const copy = { ...ticket };
    delete copy.signature;
    const expected = crypto.createHmac("sha256", hmacSecret).update(JSON.stringify(copy)).digest("hex");
    return expected === signature;
}
