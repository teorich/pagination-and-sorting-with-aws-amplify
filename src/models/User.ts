import { API, graphqlOperation } from "aws-amplify";

import { getUser as getUserQuery } from "../graphql/queries";
import { updateUser, createUser } from "../graphql/mutations";
import { GetUserQuery, CreateUserInput } from "../API";
import config from "../aws-exports.js";

API.configure(config);

export const upsertUser = async (userInput: CreateUserInput) => {
  await createUserIfNotExists(userInput);
  try {
    // Remove fields with empty strings
    const userInputWithoutEmptyFields = {
      id: userInput.id,
      bio: userInput.bio === "" ? undefined : userInput.bio,
      url: userInput.url === "" ? undefined : userInput.url,
      name: userInput.name === "" ? undefined : userInput.name
    };
    await API.graphql(
      graphqlOperation(updateUser, { input: userInputWithoutEmptyFields })
    );
  } catch (err) {
    console.warn("Failed to update user ", err);
  }
};

export const createUserIfNotExists = async (userInput: CreateUserInput) => {
  const userId = userInput.id;
  if (userId === null || userId === undefined) {
    console.warn("Cant create a user without an id. Received ", userInput);
    return;
  }
  const userQueryResult = await getUser(userId);
  if (userQueryResult.data.getUser === null) {
    try {
      await API.graphql(graphqlOperation(createUser, { input: userInput }));
    } catch (err) {
      console.warn("Failed to create user ", err);
    }
    return;
  }
};

export const getUser = async (userId: string) => {
  const userQueryResult = await (API.graphql(
    graphqlOperation(getUserQuery, { id: userId })
  ) as Promise<{ data: GetUserQuery }>);
  return userQueryResult;
};
