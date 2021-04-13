import { OperationType, Statement } from "../../entities/Statement";

export type ICreateStatementDTO = Pick<
  Statement,
  "user_id" | "receiver_id" | "type" | "amount" | "description" | "sender_id"
>;

// export interface ICreateStatementDTO {
//   user_id: string;
//   description: string;
//   amount: number;
//   type: OperationType;
//   receiver_id?: string;
// }
