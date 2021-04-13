import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../src/app";
import createConnection from "../../../src/database/index";

let connection: Connection;

describe("Statements Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to receive a token, a statement id and return the statement - 200", async () => {
    // CREATE USERS
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

    // GET TOKENS

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

      console.log(responseReceiverToken.body);
    const { user: receiver } = responseReceiverToken.body;
    const { id: receiver_id } = receiver;

    // CREATE STATEMENTS

    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "deposit" })
      .set({ Authorization: `Bearer ${sender_token}` });

    const { id: deposit_id } = responseDeposit.body;

    const responseTransfer = await request(app)
      .post(`/api/v1/statements/transfer/${receiver_id}`)
      .send({ amount: 50, description: "transfer" })
      .set({ Authorization: `Bearer ${sender_token}` });

    const { id: transfer_id } = responseTransfer.body;

    const urldeposit = `/api/v1/statements/${deposit_id}`;
    const urltransfer = `/api/v1/statements/${transfer_id}`;

    // GET OPERATIONS

    const responseDepositOperation = await request(app)
      .get(urldeposit)
      .set({ Authorization: `Bearer ${sender_token}` });

    const responseTransferOperation = await request(app)
      .get(urltransfer)
      .set({ Authorization: `Bearer ${sender_token}` });

    const { amount: deposit_amount } = responseDepositOperation.body;
    const { amount: transfer_amount } = responseTransferOperation.body;

    expect(Number(deposit_amount)).toEqual(100);
    expect(Number(transfer_amount)).toEqual(50);
    expect(responseDeposit.status).toBe(201);
  });
});
