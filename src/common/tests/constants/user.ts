import * as bcrypt from 'bcrypt';

export const BASEUSER = {
  id: 1,
  email: 'test@gmail.com',
  password: bcrypt.hashSync('password', 10),
};

export const REGISTERUSER = {
  email: 'test@gmail.com',
  password: bcrypt.hashSync('password', 10),
  repeatPassword: bcrypt.hashSync('password', 10),
};

export const UPDATE_USER = {
  email: 'update_test@gmail.com',
  password: bcrypt.hashSync('update_password', 10),
}
export const USERID = 1;

export const USER_RES = { id: 1, email: 'test@gmail.com'}
export const UPDATE_RES = { id: 1, email: 'test@gmail.com',}
export const DELETE_RES = { message: 'Deleted successfully !' };
