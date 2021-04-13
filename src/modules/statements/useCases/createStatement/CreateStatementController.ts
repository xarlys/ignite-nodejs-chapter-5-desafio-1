import { Request, Response } from "express";
import { container } from "tsyringe";

// import { OperationType } from "../../entities/Statement";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { receiver_id } = request.params;

    const splittedPath = request.originalUrl.split("/");

    const type = splittedPath.find((type) =>
      Object.values(OperationType).includes(type as OperationType)
    ) as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      receiver_id,
      type,
      amount,
      description,
    });

    return response.status(201).json(statement);
  }
}
