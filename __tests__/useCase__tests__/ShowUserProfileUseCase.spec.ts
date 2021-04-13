import { v4 as uuidv4 } from "uuid";

import { InMemoryUsersRepository } from "../../src/modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../src/modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../src/modules/users/useCases/createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "../../src/modules/users/useCases/showUserProfile/ShowUserProfileUseCase";
import { AppError } from "../../src/shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

interface ICreateUserDTOTest {
  id?: string;
  name: string;
  email: string;
  password: string;
}

describe("Show Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });
  it("should be able to show user profile", async () => {
    const userDTO: ICreateUserDTO = {
      name: "user",
      email: "email@test.com",
      password: "password",
    };

    const userCreated = await createUserUseCase.execute(userDTO);

    const result = await showUserProfileUseCase.execute(
      userCreated.id as string
    );

    expect(userCreated).toEqual(result);
  });
  it("should not be able to show user profile of a nonexisting user", async () => {
    const nonUser: ICreateUserDTOTest = {
      id: uuidv4(),
      name: "user",
      email: "email@test.com",
      password: "password",
    };

    await expect(async () => {
      await showUserProfileUseCase.execute(nonUser.id as string);
    }).rejects.toBeInstanceOf(AppError);
  });
});
