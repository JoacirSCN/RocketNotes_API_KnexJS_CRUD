const AppError = require("../utils/AppError");
const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");

const UserRepository = require("../repositories/UserRepository");
const UserCreateServices = require("../services/UserCreateServices");

class UsersController {
  async create(req, res) {
    const { name, email, password } = req.body;

    const userRepository = new UserRepository();
    const userCreateServices = new UserCreateServices(userRepository);

    await userCreateServices.execute({ name, email, password})

    return res.status(201).json();
  }

  async update(req, res) {
    const { name, email, password, old_password } = req.body;
    const user_id = req.user.id;
    
    const users = await knex('users').select('*').where('id', user_id);

    if(users.length === 0) {
      throw new AppError('Usuário não encontrado.');
    }

    const userWithUpdatedEmail  = await knex('users').select('*').where({ email });
    
    if(userWithUpdatedEmail[0] && userWithUpdatedEmail[0].id !== users[0].id) {
      throw new AppError('Este e-mail já está em uso.');
    }
    
    users[0].name = name ?? users[0].name;
    users[0].email = email ?? users[0].email;

    if(password && !old_password) {
      throw new AppError('Você precisa informar a senha antiga para definir a nova senha!')
    }

    if(password && old_password) {
      const checkOldPassword = await compare(old_password, users[0].password);

      if(!checkOldPassword) {
        throw new AppError('A senha antiga não confere.');
      }

      users[0].password = await hash(password, 8);
    }

    await knex("users").where('id', user_id).update({
      name: users[0].name,
      email: users[0].email,
      password: users[0].password,
      updated_at: new Date()
    })

    return res.status(201).json();
  }
}

module.exports = UsersController;
