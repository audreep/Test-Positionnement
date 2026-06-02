import { z } from "zod";
const s = z.string().trim().toLowerCase().email().max(160);
for (const v of ["oboubouh@lecfomasqué.com","oboubouh@lecfomasque.com","Oboubouh@LECFOMASQUÉ.com"]) {
  const r = s.safeParse(v);
  console.log(JSON.stringify(v), "=>", r.success ? JSON.stringify(r.data) : "INVALID");
}
console.log("zod version:", (await import("zod/package.json", {assert:{type:"json"}}).catch(()=>({default:{version:"?"}}))).default?.version);
