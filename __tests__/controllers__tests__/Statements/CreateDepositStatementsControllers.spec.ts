import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../src/app";
import createConnection from "../../../src/database/index";

let connection: Connection;

describe("Deposit Statements", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to receive a token, amount, description and deposit - 201", async () => {
    await request(app).post("/api/v1/users/").send({
      name: "User1",
      email: "test1@email.com",
      password: "admin1",
    });

    const responseToken = await request(app).post("/api/v1/sessions/").send({
      email: "test1@email.com",
      password: "admin1",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${token}` });

    const { amount } = response.body;

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    const { balance } = responseBalance.body;

    expect(response.status).toBe(201);
    expect(amount).toEqual(100);
    expect(amount).toEqual(balance);
  });
});
