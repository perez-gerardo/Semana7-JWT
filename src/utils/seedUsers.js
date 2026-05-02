import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Role from '../models/Role.js';

export const seedUsers = async () => {
    try {
        // Verificar si ya existe el admin
        const adminExists = await User.findOne({ email: 'admin@lab07.com' });
        const hashedPassword = await bcrypt.hash('Admin@123#', 10);

        if (adminExists) {
            // Si ya existe, nos aseguramos de que la contraseña sea la correcta
            adminExists.password = hashedPassword;
            await adminExists.save();
            console.log('🔄 Contraseña del administrador actualizada correctamente');
            return;
        }

        // Buscar el ID del rol admin
        const adminRole = await Role.findOne({ name: 'admin' });
        const userRole = await Role.findOne({ name: 'user' });

        if (!adminRole) {
            console.log('❌ Error: No se encontró el rol "admin" en la base de datos');
            return;
        }

        // Crear el admin (cumpliendo con todos los nuevos campos)
        const adminUser = new User({
            name: 'Gerardo (Admin)',
            lastName: 'Perez',
            email: 'admin@lab07.com',
            password: hashedPassword,
            phoneNumber: '999888777',
            birthdate: new Date('1990-01-01'),
            address: 'Av. Principal 123, Lima',
            url_profile: 'https://avatar.iran.liara.run/public/admin',
            roles: [adminRole._id]
        });

        await adminUser.save();
        console.log('🚀 Usuario administrador creado exitosamente');
        console.log('📧 Email: admin@lab07.com');
        console.log('🔑 Password: Admin@123#');

    } catch (error) {
        console.error('❌ Error al crear el usuario admin:', error);
    }
};
