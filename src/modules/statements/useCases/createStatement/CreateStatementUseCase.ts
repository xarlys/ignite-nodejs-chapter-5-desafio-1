import { injectable, inject } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    receiver_id,
    type,
    amount,
    description,
  }: ICreateStatementDTO): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver && type === OperationType.TRANSFER) {
      throw new CreateStatementError.ReceiverNotFound();
    }

    if (type === "withdraw" || type === "transfer") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id,
        receiver_id,
      });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      receiver_id,
      type,
      amount,
      description,
    });

    return statementOperation;
  }
}
