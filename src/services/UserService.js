import userRepository from '../repositories/UserRepository.js';

class UserService {

    async getAll() {
        return userRepository.getAll();
    }

    async getById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return this._format(user);
    }

    async updateMe(id, data) {
        const allowed = ['name', 'lastName', 'phoneNumber', 'birthdate', 'url_profile', 'address'];
        const update = {};
        for (const key of allowed) {
            if (data[key] !== undefined) update[key] = data[key];
        }
        const user = await userRepository.updateById(id, update);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.status = 404;
            throw err;
        }
        return this._format(user);
    }

    _format(user) {
        return {
            id: user._id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            birthdate: user.birthdate,
            url_profile: user.url_profile,
            address: user.address,
            roles: user.roles.map(r => r.name),
            createdAt: user.createdAt
        };
    }
}

export default new UserService();
