import { compare } from "bcryptjs";

import { InMemoryUsersRepository } from "../../src/modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../src/modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "../../src/shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "UserTest",
      email: "email@test.com",
      password: "1234",
    });

    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("password");
    expect(user.name).toEqual("UserTest");
    expect(user.email).toEqual("email@test.com");
    expect(compare(user.password, "1234")).toBeTruthy();
  });

  it("should not be able to create a user with an already used email", async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: "User",
        email: "user@test.com",
        password: "12345",
      });
      await createUserUseCase.execute({
        name: "User1",
        email: "user@test.com",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
