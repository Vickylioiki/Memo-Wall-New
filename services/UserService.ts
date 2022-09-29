import { Client } from "pg";
import { hashPassword } from "../hash";
import User from "../models/userModel";

export default class UserService {
  constructor(private client: Client) {}

  async getUsers(): Promise<User[]> {
    const result = (await this.client.query("select * from users")).rows;
    return result;
  }

  async getUsersByUsername(username: string) {
    const result =
      (await this.client.query("select * from users where usernames = $1"),
      [username]);
    return result;
  }

  async register(username: string, password: string) {
    let hashedPassword = await hashPassword(password);
    await this.client.query(
      `insert into users (usernames, password) values ($1, $2)`,
      [username, hashedPassword]
    );
  }

  async getUser(username: string) {
    let result = await this.client.query(
      "SELECT * FROM users WHERE usernames = $1",
      [username]
    );
    let db_user = result.rows[0];
    return db_user;
  }
}
