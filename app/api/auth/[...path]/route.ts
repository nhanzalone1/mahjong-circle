import { auth } from "@/lib/auth";

const handler = auth.handler();
export const { GET, POST } = handler;
