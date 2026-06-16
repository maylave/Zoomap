import { Router } from "express";
import type { Request, Response } from "express";
import * as userController from "../controllers/users.js";
import { error } from "node:console";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await userController.getAllUser();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении пользователей" });
  }
});
// router.post('/', async (req: Request, res: Response) => {
//   try {
//     const { name, email } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({ error: 'name и email обязательны' });
//     }

//     const newUser = await userController.createUser(name, email);
//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(500).json({ error: 'Ошибка при создании пользователя' });
//   }
// });

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleteUser = await userController.deleteUser(id);

    if (!deleteUser) {
      return res.status(404).json({ error: "пользователь не найден" });
    }
    res.json({ messange: "пользователь удален" });
  } catch (error) {
    res.status(500).json({ error: "ошибка при удалении пользователя" });
  }
});

export default router;
