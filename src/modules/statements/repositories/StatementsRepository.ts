import { getRepository, Repository } from "typeorm";

import { OperationType, Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    receiver_id,
    amount,
    description,
    type,
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type,
    });

    // console.log(statement);

    if (type === OperationType.TRANSFER) {
      Object.assign(statement, {
        sender_id: user_id,
        receiver_id,
      });
    }
    // console.log(statement);

    return this.repository.save(statement);
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id },
    });
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statement = await this.repository.find({
      where: [{ user_id }, { receiver_id: user_id }],
    });

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === "deposit" || user_id === operation.receiver_id) {
        return acc + Number(operation.amount);
      }

      return acc - Number(operation.amount);
    }, 0);

    if (with_statement) {
      return {
        statement,
        balance,
      };
    }

    return { balance };
  }
}
