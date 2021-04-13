import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../src/app";
import createConnection from "../../../src/database/index";

let connection: Connection;

describe("Statements Transfer", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to receive a token, amount, description and transfer - 200", async () => {
    // CREATING USERS
    await request(app).post("/api/v1/users/").send({
      name: "sender",
      email: "sender@email.com",
      password: "admin",
    });

    await request(app).post("/api/v1/users/").send({
      name: "receiver",
      email: "receiver@email.com",
      password: "admin",
    });

    // CREATING SESSIONS
    const responseSenderToken = await request(app)
      .post("/api/v1/sessions/")
      .send({
        email: "sender@email.com",
        password: "admin",
      });

    const { token: sender_token } = responseSenderToken.body;

    const responseReceiverToken = await request(app)
      .post("/api/v1/sessions/")
      .send({
        email: "receiver@email.com",
        password: "admin",
      });

    const {
      token: receiver_token,
      user: receiver,
    } = responseReceiverToken.body;
    const { id: receiver_id } = receiver;

    // DEPOSIT & TRANSFER
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${sender_token}` });

    const responseTransfer = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .send({ amount: 50, description: "transfer" })
      .set({ Authorization: `Bearer ${sender_token}` });

    const { amount: amount_transfer } = responseTransfer.body;

    // BALANCE
    const balanceSender = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${sender_token}` });

    const { balance: sender_balance } = balanceSender.body;

    const balanceReceiver = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${receiver_token}` });

    const { balance: receiver_balance } = balanceReceiver.body;

    expect(receiver_balance).toEqual(amount_transfer);
    expect(amount_transfer).toEqual(50);
    expect(sender_balance).toEqual(50);
    expect(responseTransfer.status).toBe(201);
  });
});
