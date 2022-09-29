import UserService from "../services/UserService";
import { Request, Response } from "express";
import { checkPassword } from "../hash";

export default class UserController {
  private service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  getUsers = async (req: Request, res: Response) => {
    res.json(await this.service.getUsers());
  };

  register = async (req: Request, res: Response) => {
    try {
      let username = req.body.username;
      let password = req.body.password;

      if (!username || !password) {
        //無填好就return error
        res.status(400).json({
          message: "Invaild username or password",
        });
        return;
      }

      let dbuser = await this.service.getUsersByUsername(username);

      if (dbuser) {
        res.status(400).json({ message: "username is depulicated" });
        return;
      } else {
        await this.service.register(username, password);
      }
      req.session.name = username;
      req.session.isLoggedIn = true;
      res.status(200).json({
        message: "Account created",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const username = req.body.username;
      const password = req.body.password;

      if (!username || !password) {
        //無填好就return error
        res.status(400).json({
          message: "Invaild username or password",
        });
        return;
      }

      let userResult = await this.service.getUser(username);

      let dbuser = userResult;

      if (!dbuser) {
        res.status(400).json({
          message: "Wrong username",
        });
        return;
      }

      let isMatched = await checkPassword(password, dbuser.password);
      if (isMatched) {
        console.log("matched");
        req.session.name = username;
        req.session.isLoggedIn = true;
        res.status(200).json({
          message: "Login successful",
        });
      } else {
        res.status(400).json({
          message: "Wrong password",
        });
        res.redirect("/");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "internal server error" });
    }
  };
}
