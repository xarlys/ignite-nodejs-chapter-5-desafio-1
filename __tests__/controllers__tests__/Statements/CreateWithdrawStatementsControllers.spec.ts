import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../src/app";
import createConnection from "../../../src/database/index";

let connection: Connection;

describe("Statements Withdraw", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to receive a token, amount, description and withdraw - 201", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User2",
      email: "test2@email.com",
      password: "admin2",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test2@email.com",
      password: "admin2",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 50, description: "withdraw" })
      .set({ Authorization: `Bearer ${token}` });

    const { amount } = response.body;

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    const { balance } = responseBalance.body;

    expect(amount).toEqual(50);
    expect(amount).toEqual(balance);
    expect(response.status).toBe(201);
  });
});
