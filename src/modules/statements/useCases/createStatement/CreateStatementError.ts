// eslint-disable-next-line max-classes-per-file
import { AppError } from "../../../../shared/errors/AppError";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CreateStatementError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found", 404);
    }
  }
  export class ReceiverNotFound extends AppError {
    constructor() {
      super("Receiver not found", 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }
}
