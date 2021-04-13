import { InMemoryUsersRepository } from "../../src/modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../src/modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../src/modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../src/modules/users/useCases/createUser/ICreateUserDTO";
import { AppError } from "../../src/shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });
  it("should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      name: "username",
      email: "email@test.com",
      password: "12345",
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("user.id");
    expect(result).toHaveProperty("user.email");
    expect(result).toHaveProperty("user.name");
    expect(result.token).not.toBeNull();
    expect(result.user.email).toEqual(user.email);
    expect(result.user.name).toEqual(user.name);
  });

  it("should not be able to authenticate a user with wrong password", async () => {
    await expect(async () => {
      const userright: ICreateUserDTO = {
        name: "userright",
        email: "right@email.com",
        password: "rightpass",
      };

      await createUserUseCase.execute(userright);

      await authenticateUserUseCase.execute({
        email: userright.email,
        password: "wrongpass",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate a non-existing user", async () => {
    await expect(async () => {
      const nonexistinguser: ICreateUserDTO = {
        name: "unknown",
        email: "unknown@unknown.com",
        password: "unknown",
      };

      await authenticateUserUseCase.execute({
        email: nonexistinguser.email,
        password: nonexistinguser.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
