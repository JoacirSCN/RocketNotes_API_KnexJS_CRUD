const AppError = require("../utils/AppError");
const { hash } = require("bcryptjs");

class UserCreateServices {
  constructor(userRepository){
    this.userRepository = userRepository;
  }

  async execute({ name, email, password }) {
    const checkEmailExists = await this.userRepository.findByEmail(email);

    console.log(checkEmailExists, "asdasdçlasjdhçlgfhalsçdfmhglsmdhflgmhsdf")
    
    if (checkEmailExists > 0) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const hashedPassword = await hash(password, 8);
    
    const userCreated = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return userCreated;
  }
}

module.exports = UserCreateServices;
