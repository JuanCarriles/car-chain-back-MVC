import { Request, Response } from "express";
import { Usuario, Persona, Localidad, Provincia } from "../models";
import { BaseService } from "../services/BaseService";
import { Op, where } from "sequelize";

const createPersona = async (personaData: any) => {
  return await Persona.create(personaData);
};

export class UsuariosController {
  static async getAllUsuarios(req: Request, res: Response) {
    try {
      const { page, limit, tipoUsuario, activo } = req.query;

      // Configurar paginación si se proporciona
      const pagination: any = {};
      if (page && limit) {
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        pagination.limit = limitNum;
        pagination.offset = (pageNum - 1) * limitNum;
      }

      // Configurar filtros
      const whereClause: any = {};
      if (tipoUsuario) {
        whereClause.tipoUsuario = tipoUsuario;
      }
      if (activo !== undefined) {
        whereClause.activo = activo === "true";
      }

      const usuarios = await Usuario.findAll({
        where: whereClause,
        include: [
          {
            model: Persona,
            as: "persona",
            include: [
              {
                model: Localidad,
                as: "localidad",
                include: [{ model: Provincia, as: "provincia" }],
              },
            ],
          },
        ],
        order: [["legajo", "ASC"]],
        ...pagination,
      });

      const usuariosTotal = usuarios.map((us: any) => ({
        id: us.persona_id,
        legajo: us.legajo,
        nombres: us.persona.nombres,
        apellido: us.persona.apellido,
        fechaNacimiento: us.persona.fechaNacimiento,
        tipoDocumento: us.persona.tipoDocumento,
        documento: us.persona.documento,
        domicilio: us.persona.domicilio,
        correo: us.persona.correo,
        telefono: us.persona.telefono,
        sexo: us.persona.sexo,
        tipoUsuario: us.tipoUsuario,
        activo: us.activo,
        localidad: us.persona.localidad,
      }));

      return BaseService.success(
        res,
        usuariosTotal,
        "Usuarios obtenidos exitosamente",
        usuariosTotal.length
      );
    } catch (error: any) {
      return BaseService.serverError(
        res,
        error,
        "Error al obtener los usuarios"
      );
    }
  }

  static async createUsuario(req: Request, res: Response) {
    try {
      const { personaData, tipoUsuario } = req.body;

      const existingUsuario = await Usuario.findOne({
        where: {
          activo: true,
        },
        include: [
          {
            model: Persona,
            as: "persona",
            where: { correo: personaData.correo }, // condición en Persona
          },
        ],
      });

      if (existingUsuario) {
        return BaseService.serverError(
          res,
          "Ya hay un usuario activo asignado a este correo"
        );
      }

      // Verificar si ya existe una persona con el mismo documento o correo
      const existingPersona = await Persona.findOne({
        where: {
          [Op.or]: [{ correo: personaData.correo }],
        },
      });

      if (existingPersona == null) {
        const newPerson: Persona = await createPersona(personaData);
        const nuevoUsuario = await Usuario.create({
          persona_id: newPerson.id,
          activo: true,
          tipoUsuario,
        });

        const localidad = await Localidad.findByPk(personaData.localidad_id);
        if (!localidad) {
          return BaseService.serverError(res, "Localidad no encontrada");
        }
        const provincia = await Provincia.findByPk(localidad.provincia_id);
        if (!provincia) {
          return BaseService.serverError(res, "Provincia no encontrada");
        }

        // Obtener el usuario completo con la información de la persona
        const usuarioCompleto = {
          id: newPerson.id,
          legajo: nuevoUsuario?.legajo,
          nombres: newPerson.nombres,
          apellido: newPerson.apellido,
          fechaNacimiento: newPerson.fechaNacimiento,
          tipoDocumento: newPerson.tipoDocumento,
          documento: newPerson.documento,
          domicilio: newPerson.domicilio,
          correo: newPerson.correo,
          telefono: newPerson.telefono,
          sexo: newPerson.sexo,
          tipoUsuario: nuevoUsuario.tipoUsuario,
          activo: nuevoUsuario.activo,
          localidad: {
            id: localidad.id,
            descripcion: localidad.descripcion,
            codigoPostal: localidad.codigoPostal,
            provincia_id: localidad.provincia_id,
            activo: localidad.activo,
            provincia: {
              id: provincia.id,
              descripcion: provincia.descripcion,
              activo: provincia.activo,
            },
          },
        };
        return BaseService.created(
          res,
          usuarioCompleto,
          "Usuario creado exitosamente"
        );
      } else {
        const nuevoUsuario = await Usuario.create({
          persona_id: existingPersona.id,
          activo: true,
          tipoUsuario,
        });
        // Obtener el usuario completo con la información de la persona
        const localidad = await Localidad.findByPk(personaData.localidad_id);
        if (!localidad) {
          return BaseService.serverError(res, "Localidad no encontrada");
        }
        const provincia = await Provincia.findByPk(localidad.provincia_id);
        if (!provincia) {
          return BaseService.serverError(res, "Provincia no encontrada");
        }

        // Obtener el usuario completo con la información de la persona
        const usuarioCompleto = {
          id: existingPersona.id,
          legajo: nuevoUsuario?.legajo,
          nombres: existingPersona.nombres,
          apellido: existingPersona.apellido,
          fechaNacimiento: existingPersona.fechaNacimiento,
          tipoDocumento: existingPersona.tipoDocumento,
          documento: existingPersona.documento,
          domicilio: existingPersona.domicilio,
          correo: existingPersona.correo,
          telefono: existingPersona.telefono,
          sexo: existingPersona.sexo,
          tipoUsuario: nuevoUsuario.tipoUsuario,
          activo: nuevoUsuario.activo,
          localidad: {
            id: localidad.id,
            descripcion: localidad.descripcion,
            codigoPostal: localidad.codigoPostal,
            provincia_id: localidad.provincia_id,
            activo: localidad.activo,
            provincia: {
              id: provincia.id,
              descripcion: provincia.descripcion,
              activo: provincia.activo,
            },
          },
        };
        return BaseService.created(
          res,
          usuarioCompleto,
          "Persona y usuario creado exitosamente"
        );
      }
    } catch (error: any) {
      return BaseService.serverError(res, error, "Error al crear el usuario");
    }
  }

  static async updateUsuarioState(req: Request, res: Response) {
    try {
      const { legajo } = req.params;
      const { activo } = req.body;
      const usuario = await Usuario.findByPk(legajo);
      if (!usuario) {
        return BaseService.notFound(res, "Usuario no encontrado");
      }
      usuario.activo = activo;
      await usuario.save();
      return BaseService.success(
        res,
        usuario,
        "Estado del usuario actualizado exitosamente"
      );
    } catch (error: any) {
      return BaseService.serverError(
        res,
        error,
        "Error al actualizar el estado del usuario"
      );
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { legajo } = req.params;
      const usuario = await Usuario.findByPk(legajo, {
        include: [{ model: Persona, as: "persona" }],
      });
      if (!usuario) {
        return BaseService.notFound(res, "Usuario no encontrado");
      }
      return BaseService.success(res, usuario, "Usuario obtenido exitosamente");
    } catch (error: any) {
      return BaseService.serverError(res, error, "Error al obtener el usuario");
    }
  }

  static async getPersonByMail(req: Request, res: Response) {
    try {
      const { mail } = req.params;
      const persona = await Persona.findOne({
        where: { correo: mail },
        include: [
          {
            model: Localidad,
            as: "localidad",
            include: [
              {
                model: Provincia,
                as: "provincia",
              },
            ],
          },
        ],
      });

      if (!persona) {
        return BaseService.notFound(res, "persona no encontrado");
      }
      const localidad = await Localidad.findByPk(persona.localidad_id);
      if (!localidad) {
        return BaseService.notFound(res, "localidad no encontrado");
      }
      const provincia = await Provincia.findByPk(localidad.provincia_id);
      if (!provincia) {
        return BaseService.notFound(res, "provincia no encontrado");
      }
      const finalPerson = {
        nombres: persona.nombres,
        apellido: persona.apellido,
        fechaNacimiento: persona.fechaNacimiento,
        tipoDocumento: persona.tipoDocumento,
        documento: persona.documento,
        domicilio: persona.domicilio,
        correo: persona.correo,
        telefono: persona.telefono,
        sexo: persona.sexo,
        localidad: {
          id: localidad.id,
          descripcion: localidad.descripcion,
          codigoPostal: localidad.codigoPostal,
          activo: localidad.activo,
          provincia: {
            id: provincia.id,
            descripcion: provincia.descripcion,
            activo: provincia.activo,
          },
        },
      };
      return BaseService.success(
        res,
        finalPerson,
        "Persona obtenido exitosamente"
      );
    } catch (error: any) {
      return BaseService.serverError(res, error, "Error al obtener el usuario");
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { legajo } = req.params;
      const { personaData, tipoUsuario, activo } = req.body;

      if (activo) {
        const existingUsuario = await Usuario.findOne({
          where: {
            activo: true, // sigue siendo activo
            legajo: { [Op.ne]: legajo }, // distinto del legajo recibido
          },
          include: [
            {
              model: Persona,
              as: "persona",
              where: { correo: personaData.correo }, // correo a verificar
            },
          ],
        });
        if (existingUsuario) {
          return BaseService.notFound(
            res,
            "No puedes activar este usuario porque ya hay un usuario activo con ese correo"
          );
        }
      }

      const usuario = await Usuario.findByPk(legajo, {
        include: [{ model: Persona, as: "persona" }],
      });

      if (!usuario) {
        return BaseService.notFound(res, "Usuario no encontrado");
      }

      // Si se proporcionan datos de persona, verificar duplicados
      if (personaData && (personaData.documento || personaData.correo)) {
        const whereConditions = [];
        if (personaData.documento) {
          whereConditions.push({ documento: personaData.documento });
        }
        if (personaData.correo) {
          whereConditions.push({ correo: personaData.correo });
        }

        const existingPersona = await Persona.findOne({
          where: {
            [Op.or]: whereConditions,
            id: { [Op.ne]: usuario.persona_id }, // Excluir la persona actual
          },
        });

        if (existingPersona) {
          return BaseService.validationError(res, {
            array: () => [
              {
                msg: "Ya existe otra persona con el mismo documento o correo electrónico",
                path: "personaData",
              },
            ],
          } as any);
        }
      }

      // Actualizar datos de la persona si se proporcionan
      if (personaData) {
        const persona = await Persona.findByPk(usuario.persona_id);
        if (persona) {
          await persona.update(personaData);
        }

        // Actualizar datos del usuario
        if (tipoUsuario !== undefined) usuario.tipoUsuario = tipoUsuario;
        if (activo !== undefined) usuario.activo = activo;
        await usuario.save();
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        console.log(usuario);
        // Obtener el usuario actualizado con la información de la persona
        const usuarioActualizado = await Usuario.findByPk(legajo, {
          include: [{ model: Persona, as: "persona" }],
        });

        // Obtener el usuario completo con la información de la persona
        const localidad = await Localidad.findByPk(personaData.localidad_id);
        if (!localidad) {
          return BaseService.serverError(res, "Localidad no encontrada");
        }
        const provincia = await Provincia.findByPk(localidad.provincia_id);
        if (!provincia) {
          return BaseService.serverError(res, "Provincia no encontrada");
        }
        const usuarioCompleto = {
          id: personaData.id,
          legajo: usuarioActualizado?.legajo,
          nombres: personaData.nombres,
          apellido: personaData.apellido,
          fechaNacimiento: personaData.fechaNacimiento,
          tipoDocumento: personaData.tipoDocumento,
          documento: personaData.documento,
          domicilio: personaData.domicilio,
          correo: personaData.correo,
          telefono: personaData.telefono,
          sexo: personaData.sexo,
          tipoUsuario: usuarioActualizado?.tipoUsuario,
          activo: usuarioActualizado?.activo,
          localidad: {
            id: localidad.id,
            descripcion: localidad.descripcion,
            codigoPostal: localidad.codigoPostal,
            provincia_id: localidad.provincia_id,
            activo: localidad.activo,
            provincia: {
              id: provincia.id,
              descripcion: provincia.descripcion,
              activo: provincia.activo,
            },
          },
        };
        console.log("usuarioCompleto");
        console.log(usuarioCompleto);

        return BaseService.success(
          res,
          usuarioCompleto,
          "Usuario actualizado exitosamente"
        );
      }
    } catch (error: any) {
      return BaseService.serverError(
        res,
        error,
        "Error al actualizar el usuario"
      );
    }
  }

  static async getUserTypeByMail(req: Request, res: Response) {
    try {
      const { mail } = req.params;
      const usuario = await Usuario.findOne({
        include: [
          {
            model: Persona,
            as: "persona",
            where: {
              correo: mail,
            },
          },
        ],
      });
      if (!usuario) {
        return BaseService.success(
          res,
          "CLIENTE",
          "Usuario obtenido exitosamente"
        );
      }
      return BaseService.success(
        res,
        usuario.tipoUsuario,
        "Usuario obtenido exitosamente"
      );
    } catch (error: any) {
      return BaseService.serverError(res, error, "Error al obtener el usuario");
    }
  }
}
