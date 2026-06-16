import  {eq } from 'drizzle-orm'
import { db } from '../db/index.js'; // <-- импорт db
import { users } from '../db/schema.js'; // <-- импорт схемы

export async function getAllUser() {
    return await db.select().from(users);
}
// export async function createUser(name:string ,email:string) {
//     const result = await db.insert(users).values({ name, email }).returning();
//     console.log(result)
//   return result[0];
// }
export async function deleteUser(id:number) {
    const result = await db.delete(users).where(eq(users.id, id)).returning()
    return result[0]
}