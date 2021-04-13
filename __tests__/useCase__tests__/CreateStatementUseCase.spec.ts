import { v4 as uuidv4 } from "uuid";

import { InMemoryStatementsRepository } from "../../src/modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../src/modules/statements/useCases/createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../../src/modules/statements/useCases/getBalance/GetBalanceUseCase";
import { InMemoryUsersRepository } from "../../src/modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../src/modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../src/modules/users/useCases/createUser/ICreateUserDTO";
import { AppError } from "../../src/shared/errors/AppError";

interface IRequest {
  user_id: string;
}

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statements", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to create a new deposit", async () => {
    const userDTO: ICreateUserDTO = {
      name: "user",
      email: "email@test.com",
      password: "12345",
    };

    const user = await createUserUseCase.execute(userDTO);

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: "deposit test",
      amount: 100,
      type: "deposit" as OperationType,
    });

    expect(statement).toHaveProperty("user_id");
    expect(statement).toHaveProperty("description");
    expect(statement).toHaveProperty("amount");
    expect(statement.amount).toEqual(100);
    expect(statement.description).toEqual("deposit test");
    expect(statement.type).toEqual("deposit");
  });

  it("should be able to create a new withdraw", async () => {
    const userDTO: ICreateUserDTO = {
      name: "user",
      email: "email@test.com",
      password: "12345",
    };

    const user = await createUserUseCase.execute(userDTO);

    const statementDeposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: "deposit test",
      amount: 100,
      type: "deposit" as OperationType,
    });

    const statementWithdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: "withdraw test",
      amount: 100,
      type: "withdraw" as OperationType,
    });

    const iRequestStub = <IRequest>{ user_id: user.id };

    const balance = await getBalanceUseCase.execute(iRequestStub);

    expect(statementDeposit.amount).toEqual(100);
    expect(statementWithdraw.amount).toEqual(100);
    expect(balance.balance).toEqual(0);
  });

  it("should be able to create a new transfer", async () => {
    const userSenderDTO: ICreateUserDTO = {
      name: "sender",
      email: "sender@test.com",
      password: "sender",
    };

    const userReceiverDTO: ICreateUserDTO = {
      name: "receiver",
      email: "receiver@test.com",
      password: "receiver",
    };

    const sender = await createUserUseCase.execute(userSenderDTO);
    const receiver = await createUserUseCase.execute(userReceiverDTO);

    const statementDeposit = await createStatementUseCase.execute({
      user_id: sender.id as string,
      description: "deposit test",
      amount: 100,
      type: "deposit" as OperationType,
    });

    const statementTransfer = await createStatementUseCase.execute({
      user_id: sender.id as string,
      receiver_id: receiver.id as string,
      description: "withdraw test",
      amount: 50,
      type: "transfer" as OperationType,
    });

    const iRequestStubSender = <IRequest>{ user_id: sender.id };
    const iRequestStubReceiver = <IRequest>{ user_id: receiver.id };

    const balanceSender = await getBalanceUseCase.execute(iRequestStubSender);
    const balanceReceiver = await getBalanceUseCase.execute(
      iRequestStubReceiver
    );

    expect(statementDeposit.amount).toEqual(100);
    expect(statementTransfer.amount).toEqual(50);
    expect(balanceSender.balance).toEqual(50);
    expect(balanceReceiver.balance).toEqual(statementTransfer.amount);
  });

  it("should not be able to create a withdraw > balance", async () => {
    await expect(async () => {
      const userDTO: ICreateUserDTO = {
        name: "user",
        email: "email@test.com",
        password: "12345",
      };

      const user = await createUserUseCase.execute(userDTO);

      await createStatementUseCase.execute({
        user_id: user.id as string,
        description: "deposit test",
        amount: 100,
        type: "deposit" as OperationType,
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        description: "withdraw test",
        amount: 150,
        type: "withdraw" as OperationType,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a deposit for a non existing user", async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: uuidv4() as string,
        description: "deposit test",
        amount: 100,
        type: "deposit" as OperationType,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a withdraw for a non existing user", async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: uuidv4() as string,
        description: "withdraw test",
        amount: 100,
        type: "deposit" as OperationType,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
