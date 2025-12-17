import dotenv from "dotenv";
import sequelize from "../src/config/database";
import { TipoUsuario } from "../src/models/Usuario";

// Importar modelos básicos
import Provincia from "../src/models/Provincia";
import Localidad from "../src/models/Localidad";
import Marca from "../src/models/Marca";
import Modelo from "../src/models/Modelo";
import Version from "../src/models/Version";
import Persona from "../src/models/Persona";
import Cliente from "../src/models/Cliente";
import Usuario from "../src/models/Usuario";
import Vehiculo from "../src/models/Vehiculo";
import Cobertura from "../src/models/Cobertura";
import Detalle from "../src/models/Detalle";
import CoberturaDetalle from "../src/models/CoberturaDetalle";
import PeriodoPago from "../src/models/PeriodoPago";
import TipoContratacion from "../src/models/TipoContratacion";
import Pago from "../src/models/Pago";
import Documentacion from "../src/models/Documentacion";
import Cotizacion from "../src/models/Cotizacion";
import LineaCotizacion from "../src/models/LineaCotizacion";
import Poliza from "../src/models/Poliza";
import ConfigEdad from "../src/models/ConfigEdad";
import ConfigLocalidad from "../src/models/ConfigLocalidad";
import ConfigAntiguedad from "../src/models/ConfigAntiguedad";
import Siniestro from "../src/models/Siniestro";

dotenv.config();

class SimpleDataSeeder {
  private async clearTables() {
    console.log("🗑️  Limpiando base de datos y reiniciando IDs...");

    // 🔒 Desactivar constraints
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // 🧹 Tablas en orden de dependencia (de hijas a padres)
    const tables = [
      "siniestro",
      "pago",
      "poliza",
      "lineacotizacion",
      "cotizacion",
      "documentacion",
      "tipocontratacion",
      "periodopago",
      "coberturadetalle",
      "detalle",
      "cobertura",
      "vehiculo",
      "version",
      "modelo",
      "marca",
      "cliente",
      "usuario",
      "persona",
      "configuracionlocalidad",
      "configuracionedad",
      "configuracionantiguedad",
      "localidad",
      "provincia",
    ];

    // 🗑️ Eliminar contenido y reiniciar autoincrement
    for (const table of tables) {
      try {
        await sequelize.query(`DELETE FROM ${table}`);
        await sequelize.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
      } catch (error) {
        console.log(`⚠️  Error al limpiar tabla: ${table}`, error);
      }
    }

    // 🔓 Reactivar constraints
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Base de datos limpiada y IDs reiniciados");
  }

  private async seedProvincias() {
    console.log("📍 Creando provincias...");

    const provincias = [
      { descripcion: "Buenos Aires", activo: true },
      { descripcion: "Córdoba", activo: true },
      { descripcion: "Santa Fe", activo: true },
      { descripcion: "Mendoza", activo: true },
      { descripcion: "Ciudad Autónoma de Buenos Aires", activo: true },
    ];

    const created = await Provincia.bulkCreate(provincias);
    console.log(`✅ ${created.length} provincias creadas`);
    return created;
  }

  private async seedLocalidades() {
    console.log("🏘️  Creating localidades...");

    // Primero obtenemos las provincias que acabamos de crear
    const provincias = await Provincia.findAll();
    console.log(`Found ${provincias.length} provincias for reference`);

    const localidades = [
      {
        descripcion: "La Plata",
        codigoPostal: "1900",
        provincia_id: provincias[0].id,
        activo: true,
      },
      {
        descripcion: "Mar del Plata",
        codigoPostal: "7600",
        provincia_id: provincias[0].id,
        activo: true,
      },
      {
        descripcion: "Córdoba Capital",
        codigoPostal: "5000",
        provincia_id: provincias[1].id,
        activo: true,
      },
      {
        descripcion: "Rosario",
        codigoPostal: "2000",
        provincia_id: provincias[2].id,
        activo: true,
      },
      {
        descripcion: "Palermo",
        codigoPostal: "1425",
        provincia_id: provincias[4].id,
        activo: true,
      },
    ];

    const created = await Localidad.bulkCreate(localidades);
    console.log(`✅ ${created.length} localidades creadas`);
    return created;
  }

  private async seedMarcas() {
    console.log("🚗 Creando marcas...");

    const marcas = [
      {
        nombre: "Toyota",
        descripcion: "Toyota Motor Corporation",
        activo: true,
      },
      { nombre: "Ford", descripcion: "Ford Motor Company", activo: true },
      { nombre: "Chevrolet", descripcion: "General Motors", activo: true },
      { nombre: "Volkswagen", descripcion: "Volkswagen AG", activo: true },
      {
        nombre: "Fiat",
        descripcion: "Fiat Chrysler Automobiles",
        activo: true,
      },
    ];

    const created = await Marca.bulkCreate(marcas);
    console.log(`✅ ${created.length} marcas creadas`);
    return created;
  }

  private async seedModelos() {
    console.log("🚙 Creando modelos...");

    // Obtener las marcas que acabamos de crear
    const marcas = await Marca.findAll();
    console.log(`Found ${marcas.length} marcas for reference`);

    const modelos = [
      {
        nombre: "Corolla",
        descripcion: "Sedán compacto",
        marca_id: marcas[0].id,
        activo: true,
      },
      {
        nombre: "Hilux",
        descripcion: "Pick-up mediana",
        marca_id: marcas[0].id,
        activo: true,
      },
      {
        nombre: "Ka",
        descripcion: "Hatchback urbano",
        marca_id: marcas[1].id,
        activo: true,
      },
      {
        nombre: "Focus",
        descripcion: "Hatchback compacto",
        marca_id: marcas[1].id,
        activo: true,
      },
      {
        nombre: "Onix",
        descripcion: "Hatchback compacto",
        marca_id: marcas[2].id,
        activo: true,
      },
      {
        nombre: "Gol",
        descripcion: "Hatchback económico",
        marca_id: marcas[3].id,
        activo: true,
      },
      {
        nombre: "Uno",
        descripcion: "Hatchback económico",
        marca_id: marcas[4].id,
        activo: true,
      },
    ];

    const created = await Modelo.bulkCreate(modelos);
    console.log(`✅ ${created.length} modelos creados`);
    return created;
  }

  private async seedVersiones() {
    console.log("🔧 Creando versiones...");

    // Obtener los modelos que acabamos de crear
    const modelos = await Modelo.findAll();
    console.log(`Found ${modelos.length} modelos for reference`);

    const versiones = [
      {
        nombre: "XLI",
        descripcion: "XLI 1.8 MT",
        precio_mercado: 3500000,
        precio_mercado_gnc: 3700000,
        modelo_id: modelos[0].id,
        activo: true,
      },
      {
        nombre: "XEI",
        descripcion: "XEI 1.8 CVT",
        precio_mercado: 4200000,
        precio_mercado_gnc: 4400000,
        modelo_id: modelos[0].id,
        activo: true,
      },
      {
        nombre: "DX",
        descripcion: "DX 2.4 4x2 CD",
        precio_mercado: 5500000,
        precio_mercado_gnc: 5800000,
        modelo_id: modelos[1].id,
        activo: true,
      },
      {
        nombre: "S",
        descripcion: "S 1.5",
        precio_mercado: 2800000,
        precio_mercado_gnc: 3000000,
        modelo_id: modelos[2].id,
        activo: true,
      },
      {
        nombre: "SE",
        descripcion: "SE 1.5",
        precio_mercado: 3200000,
        precio_mercado_gnc: 3400000,
        modelo_id: modelos[3].id,
        activo: true,
      },
      {
        nombre: "Joy",
        descripcion: "Joy 1.4",
        precio_mercado: 2600000,
        precio_mercado_gnc: 2800000,
        modelo_id: modelos[4].id,
        activo: true,
      },
      {
        nombre: "Trend",
        descripcion: "Trendline 1.6",
        precio_mercado: 2400000,
        precio_mercado_gnc: 2600000,
        modelo_id: modelos[5].id,
        activo: true,
      },
      {
        nombre: "Way",
        descripcion: "Way 1.4",
        precio_mercado: 2200000,
        precio_mercado_gnc: 2400000,
        modelo_id: modelos[6].id,
        activo: true,
      },
    ];

    const created = await Version.bulkCreate(versiones);
    console.log(`✅ ${created.length} versiones creadas`);
    return created;
  }

  private async seedPersonas() {
    console.log("👥 Creando personas...");

    // Obtener las localidades que acabamos de crear
    const localidades = await Localidad.findAll();
    console.log(`Found ${localidades.length} localidades for reference`);

    const personas = [
      {
        nombres: "Juan Carlos",
        apellido: "García López",
        fechaNacimiento: new Date("1985-03-15"),
        tipoDocumento: "DNI" as any,
        documento: "20123456789",
        telefono: "11-4555-1234",
        correo: "juan.garcia@email.com",
        domicilio: "Av. Corrientes 1234",
        sexo: "Masculino",
        localidad_id: localidades[0].id,
      },
      {
        nombres: "María Elena",
        apellido: "Rodríguez Martín",
        fechaNacimiento: new Date("1990-07-22"),
        tipoDocumento: "DNI" as any,
        documento: "27234567890",
        telefono: "11-4555-5678",
        correo: "maria.rodriguez@email.com",
        domicilio: "Calle 50 N° 567",
        sexo: "Femenino",
        localidad_id: localidades[0].id,
      },
      {
        nombres: "Carlos Alberto",
        apellido: "López Fernández",
        fechaNacimiento: new Date("1982-11-08"),
        tipoDocumento: "DNI" as any,
        documento: "23345678901",
        telefono: "341-4555-9012",
        correo: "carlos.lopez@email.com",
        domicilio: "San Martín 890",
        sexo: "Masculino",
        localidad_id: localidades[3].id,
      },
      {
        nombres: "Ana Sofía",
        apellido: "Martínez Gómez",
        fechaNacimiento: new Date("1995-01-30"),
        tipoDocumento: "DNI" as any,
        documento: "30456789012",
        telefono: "351-4555-3456",
        correo: "ana.martinez@email.com",
        domicilio: "Rivadavia 456",
        sexo: "Femenino",
        localidad_id: localidades[2].id,
      },
      {
        nombres: "Roberto Daniel",
        apellido: "Fernández Silva",
        fechaNacimiento: new Date("1988-09-12"),
        tipoDocumento: "DNI" as any,
        documento: "25567890123",
        telefono: "223-4555-7890",
        correo: "roberto.fernandez@email.com",
        domicilio: "Belgrano 789",
        sexo: "Masculino",
        localidad_id: localidades[1].id,
      },
      {
        nombres: "Admin",
        apellido: "Master",
        fechaNacimiento: new Date("1980-01-01"),
        tipoDocumento: "DNI",
        documento: "10000001",
        telefono: "11-8888-8888",
        correo: "juanmcarriles@gmail.com",
        domicilio: "Sistema 123",
        sexo: "Masculino",
        localidad_id: localidades[0].id,
      },
      {
        nombres: "Vendedor",
        apellido: "Oficial",
        fechaNacimiento: new Date("1987-02-02"),
        tipoDocumento: "DNI",
        documento: "10000002",
        telefono: "11-7777-7777",
        correo: "luffyesmejor@gmail.com",
        domicilio: "Ruta 50",
        sexo: "Femenino",
        localidad_id: localidades[1].id,
      },
      {
        nombres: "Supervisor",
        apellido: "Central",
        fechaNacimiento: new Date("1979-03-03"),
        tipoDocumento: "DNI",
        documento: "10000003",
        telefono: "11-6666-6666",
        correo: "pedrooas65@gmail.com",
        domicilio: "Zona Sur",
        sexo: "Masculino",
        localidad_id: localidades[2].id,
      },
      // Additional clients for more test data
      {
        nombres: "Laura Patricia",
        apellido: "González Ruiz",
        fechaNacimiento: new Date("1992-05-20"),
        tipoDocumento: "DNI" as any,
        documento: "28678901234",
        telefono: "11-4555-2222",
        correo: "laura.gonzalez@email.com",
        domicilio: "San Juan 1122",
        sexo: "Femenino",
        localidad_id: localidades[0].id,
      },
      {
        nombres: "Diego Martín",
        apellido: "Sánchez Torres",
        fechaNacimiento: new Date("1986-08-14"),
        tipoDocumento: "DNI" as any,
        documento: "24789012345",
        telefono: "223-4555-3333",
        correo: "diego.sanchez@email.com",
        domicilio: "Moreno 445",
        sexo: "Masculino",
        localidad_id: localidades[1].id,
      },
      {
        nombres: "Fernanda Isabel",
        apellido: "Ramírez Castro",
        fechaNacimiento: new Date("1994-12-03"),
        tipoDocumento: "DNI" as any,
        documento: "29890123456",
        telefono: "351-4555-4444",
        correo: "fernanda.ramirez@email.com",
        domicilio: "Sarmiento 789",
        sexo: "Femenino",
        localidad_id: localidades[2].id,
      },
      {
        nombres: "Pablo Andrés",
        apellido: "Morales Vega",
        fechaNacimiento: new Date("1983-04-25"),
        tipoDocumento: "DNI" as any,
        documento: "22901234567",
        telefono: "341-4555-5555",
        correo: "pablo.morales@email.com",
        domicilio: "Mitre 334",
        sexo: "Masculino",
        localidad_id: localidades[3].id,
      },
      {
        nombres: "Claudia Beatriz",
        apellido: "Herrera Díaz",
        fechaNacimiento: new Date("1991-09-17"),
        tipoDocumento: "DNI" as any,
        documento: "27012345678",
        telefono: "11-4555-6666",
        correo: "claudia.herrera@email.com",
        domicilio: "Constitución 556",
        sexo: "Femenino",
        localidad_id: localidades[4].id,
      },
      {
        nombres: "Gustavo Adolfo",
        apellido: "Navarro Peña",
        fechaNacimiento: new Date("1989-11-29"),
        tipoDocumento: "DNI" as any,
        documento: "26123456789",
        telefono: "223-4555-7777",
        correo: "gustavo.navarro@email.com",
        domicilio: "Libertad 223",
        sexo: "Masculino",
        localidad_id: localidades[1].id,
      },
      {
        nombres: "Valeria Soledad",
        apellido: "Ortiz Méndez",
        fechaNacimiento: new Date("1996-02-11"),
        tipoDocumento: "DNI" as any,
        documento: "31234567890",
        telefono: "351-4555-8888",
        correo: "valeria.ortiz@email.com",
        domicilio: "Independencia 998",
        sexo: "Femenino",
        localidad_id: localidades[2].id,
      },
    ];

    const created = await Persona.bulkCreate(personas);
    console.log(`✅ ${created.length} personas creadas`);
    return created;
  }

  private async seedUsuarios() {
    console.log("👤 Creando usuarios...");

    // Obtener las personas que acabamos de crear
    const personas = await Persona.findAll();
    console.log(`Found ${personas.length} personas for reference`);

    const usuarios = [
      {
        tipoUsuario: TipoUsuario.ADMINISTRADOR,
        persona_id: personas[5].id,
        activo: true,
      },
      {
        tipoUsuario: TipoUsuario.VENDEDOR,
        persona_id: personas[6].id,
        activo: true,
      },
      {
        tipoUsuario: TipoUsuario.GESTOR_DE_SINIESTROS,
        persona_id: personas[7].id,
        activo: true,
      },
    ];

    const created = await Usuario.bulkCreate(usuarios);
    console.log(`✅ ${created.length} usuarios creados`);
    return created;
  }

  private async seedClientes() {
    console.log("👨‍💼 Creando clientes...");

    // Obtener las personas que acabamos de crear
    const personas = await Persona.findAll();
    console.log(`Found ${personas.length} personas for reference`);

    // Create clients for all persons except the first 3 system users
    const clientes = personas.map((persona) => ({
      persona_id: persona.id,
    }));

    const created = await Cliente.bulkCreate(clientes);
    console.log(`✅ ${created.length} clientes creados`);
    return created;
  }

  private async seedVehiculos() {
    console.log("🚗 Creando vehículos...");

    // Obtener las referencias que necesitamos
    const clientes = await Cliente.findAll();
    const versiones = await Version.findAll();
    console.log(
      `Found ${clientes.length} clientes and ${versiones.length} versiones for reference`
    );

    const vehiculos = [
      {
        matricula: "ABC123",
        chasis: "9BWZZZ377VT004251",
        numeroMotor: "2TR001234",
        añoFabricacion: 2020,
        gnc: false,
        cliente_id: clientes[0].idClient,
        version_id: versiones[0].id,
      },
      {
        matricula: "DEF456",
        chasis: "9BWZZZ377VT004252",
        numeroMotor: "2TR001235",
        añoFabricacion: 2021,
        gnc: false,
        cliente_id: clientes[1].idClient,
        version_id: versiones[2].id,
      },
      {
        matricula: "GHI789",
        chasis: "9BWZZZ377VT004253",
        numeroMotor: "1KR001236",
        añoFabricacion: 2019,
        gnc: true,
        cliente_id: clientes[2].idClient,
        version_id: versiones[3].id,
      },
      {
        matricula: "JKL012",
        chasis: "9BWZZZ377VT004254",
        numeroMotor: "1KR001237",
        añoFabricacion: 2022,
        gnc: false,
        cliente_id: clientes[3].idClient,
        version_id: versiones[5].id,
      },
      {
        matricula: "MNO345",
        chasis: "9BWZZZ377VT004255",
        numeroMotor: "2TR001238",
        añoFabricacion: 2018,
        gnc: true,
        cliente_id: clientes[4].idClient,
        version_id: versiones[1].id,
      },
      {
        matricula: "PQR678",
        chasis: "9BWZZZ377VT004256",
        numeroMotor: "1KR001239",
        añoFabricacion: 2023,
        gnc: false,
        cliente_id: clientes[5].idClient,
        version_id: versiones[4].id,
      },
      {
        matricula: "STU901",
        chasis: "9BWZZZ377VT004257",
        numeroMotor: "2TR001240",
        añoFabricacion: 2020,
        gnc: false,
        cliente_id: clientes[6].idClient,
        version_id: versiones[6].id,
      },
      {
        matricula: "VWX234",
        chasis: "9BWZZZ377VT004258",
        numeroMotor: "1KR001241",
        añoFabricacion: 2019,
        gnc: true,
        cliente_id: clientes[7].idClient,
        version_id: versiones[7].id,
      },
      {
        matricula: "YZA567",
        chasis: "9BWZZZ377VT004259",
        numeroMotor: "2TR001242",
        añoFabricacion: 2021,
        gnc: false,
        cliente_id: clientes[8]?.idClient || clientes[0].idClient,
        version_id: versiones[0].id,
      },
      {
        matricula: "BCD890",
        chasis: "9BWZZZ377VT004260",
        numeroMotor: "1KR001243",
        añoFabricacion: 2022,
        gnc: false,
        cliente_id: clientes[9]?.idClient || clientes[1].idClient,
        version_id: versiones[3].id,
      },
      {
        matricula: "EFG123",
        chasis: "9BWZZZ377VT004261",
        numeroMotor: "2TR001244",
        añoFabricacion: 2020,
        gnc: true,
        cliente_id: clientes[10]?.idClient || clientes[2].idClient,
        version_id: versiones[2].id,
      },
      {
        matricula: "HIJ456",
        chasis: "9BWZZZ377VT004262",
        numeroMotor: "1KR001245",
        añoFabricacion: 2023,
        gnc: false,
        cliente_id: clientes[11]?.idClient || clientes[3].idClient,
        version_id: versiones[5].id,
      },
      // Nuevos vehículos para más datos
      {
        matricula: "KLM789",
        chasis: "9BWZZZ377VT004263",
        numeroMotor: "2TR001246",
        añoFabricacion: 2021,
        gnc: true,
        cliente_id: clientes[12]?.idClient || clientes[4].idClient,
        version_id: versiones[1].id,
      },
      {
        matricula: "NOP012",
        chasis: "9BWZZZ377VT004264",
        numeroMotor: "1KR001247",
        añoFabricacion: 2022,
        gnc: false,
        cliente_id: clientes[13]?.idClient || clientes[5].idClient,
        version_id: versiones[4].id,
      },
      {
        matricula: "QRS345",
        chasis: "9BWZZZ377VT004265",
        numeroMotor: "2TR001248",
        añoFabricacion: 2020,
        gnc: false,
        cliente_id: clientes[14]?.idClient || clientes[6].idClient,
        version_id: versiones[6].id,
      },
      {
        matricula: "TUV678",
        chasis: "9BWZZZ377VT004266",
        numeroMotor: "1KR001249",
        añoFabricacion: 2019,
        gnc: true,
        cliente_id: clientes[0].idClient,
        version_id: versiones[7].id,
      },
      {
        matricula: "WXY901",
        chasis: "9BWZZZ377VT004267",
        numeroMotor: "2TR001250",
        añoFabricacion: 2023,
        gnc: false,
        cliente_id: clientes[1].idClient,
        version_id: versiones[0].id,
      },
      {
        matricula: "ZAB234",
        chasis: "9BWZZZ377VT004268",
        numeroMotor: "1KR001251",
        añoFabricacion: 2021,
        gnc: true,
        cliente_id: clientes[2].idClient,
        version_id: versiones[2].id,
      },
      {
        matricula: "CDE567",
        chasis: "9BWZZZ377VT004269",
        numeroMotor: "2TR001252",
        añoFabricacion: 2020,
        gnc: false,
        cliente_id: clientes[3].idClient,
        version_id: versiones[3].id,
      },
      {
        matricula: "FGH890",
        chasis: "9BWZZZ377VT004270",
        numeroMotor: "1KR001253",
        añoFabricacion: 2022,
        gnc: false,
        cliente_id: clientes[4].idClient,
        version_id: versiones[5].id,
      },
      {
        matricula: "IJK123",
        chasis: "9BWZZZ377VT004271",
        numeroMotor: "2TR001254",
        añoFabricacion: 2019,
        gnc: true,
        cliente_id: clientes[5].idClient,
        version_id: versiones[1].id,
      },
      {
        matricula: "LMN456",
        chasis: "9BWZZZ377VT004272",
        numeroMotor: "1KR001255",
        añoFabricacion: 2023,
        gnc: false,
        cliente_id: clientes[6].idClient,
        version_id: versiones[4].id,
      },
      {
        matricula: "OPQ789",
        chasis: "9BWZZZ377VT004273",
        numeroMotor: "2TR001256",
        añoFabricacion: 2021,
        gnc: true,
        cliente_id: clientes[7].idClient,
        version_id: versiones[6].id,
      },
      {
        matricula: "RST012",
        chasis: "9BWZZZ377VT004274",
        numeroMotor: "1KR001257",
        añoFabricacion: 2020,
        gnc: false,
        cliente_id: clientes[8]?.idClient || clientes[0].idClient,
        version_id: versiones[7].id,
      },
      {
        matricula: "UVW345",
        chasis: "9BWZZZ377VT004275",
        numeroMotor: "2TR001258",
        añoFabricacion: 2022,
        gnc: false,
        cliente_id: clientes[9]?.idClient || clientes[1].idClient,
        version_id: versiones[0].id,
      },
    ];

    const created = await Vehiculo.bulkCreate(vehiculos);
    console.log(`✅ ${created.length} vehículos creados`);
    return created;
  }

  private async seedCoberturas() {
    console.log("🛡️  Creando coberturas...");

    const coberturas = [
      {
        nombre: "Cobertura Básica",
        descripcion: "Cubre daños menores",
        recargoPorAtraso: 2.5,
        activo: true,
      },
      {
        nombre: "Cobertura Intermedia",
        descripcion: "Cubre daños importantes excepto destrucción total",
        recargoPorAtraso: 3.5,
        activo: true,
      },
      {
        nombre: "Cobertura Total",
        descripcion: "Cubre todo tipo de daños",
        recargoPorAtraso: 5.0,
        activo: true,
      },
    ];

    const created = await Cobertura.bulkCreate(coberturas);
    console.log(`✅ ${created.length} coberturas creadas`);
    return created;
  }

  private async seedDetalles() {
    console.log("📋 Creando detalles...");

    const detalles = [
      {
        nombre: "Responsable Civil hasta $23.000.000",
        descripcion: "Te cubrimos hasta 23 millones de pesos",
        porcentaje_miles: 0,
        monto_fijo: 23000000,
        activo: true,
      },
      {
        nombre: "Pérdida Total por Incendio",
        descripcion: "Cobertura ante incendios totales",
        porcentaje_miles: 2,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Robo o Hurto Total",
        descripcion: "Te protegemos en caso de robo o hurto total",
        porcentaje_miles: 3,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Destrucción Total por Accidente",
        descripcion: "Cubre destrucción total por accidente",
        porcentaje_miles: 4,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Responsabilidad Civil hacia terceros",
        descripcion: "Incluye responsabilidad civil",
        porcentaje_miles: 5,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Daños Parciales por Accidente",
        descripcion: "Cubre daños parciales por accidente",
        porcentaje_miles: 6,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Daños Parciales por Granizo",
        descripcion: "Cubre daños parciales por granizo",
        porcentaje_miles: 7,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Robo o Hurto Parcial",
        descripcion: "Cubre robo o hurto parcial",
        porcentaje_miles: 8,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Cristales Laterales",
        descripcion: "Cobertura de cristales laterales",
        porcentaje_miles: 9,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Parabrisas y Luneta",
        descripcion: "Cobertura de parabrisas y luneta",
        porcentaje_miles: 10,
        monto_fijo: 0,
        activo: true,
      },
      {
        nombre: "Parabrisas y Luneta2",
        descripcion: "Cobertura de parabrisas y luneta",
        porcentaje_miles: 10,
        monto_fijo: 0,
        activo: false,
      },
    ];

    const created = await Detalle.bulkCreate(detalles);
    console.log(`✅ ${created.length} detalles creados`);
    return created;
  }

  private async seedCoberturaDetalles() {
    console.log("🔗 Creando relaciones cobertura-detalle...");

    // Obtener las coberturas y detalles que acabamos de crear
    const coberturas = await Cobertura.findAll();
    const detalles = await Detalle.findAll();
    console.log(
      `Found ${coberturas.length} coberturas and ${detalles.length} detalles for reference`
    );

    const relaciones = [
      // Cobertura Básica (id: 1)
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[0].id, // Responsable Civil hasta $23.000.000
        aplica: true,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[1].id, // Pérdida Total por Incendio
        aplica: false,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[2].id, // Robo o Hurto Total
        aplica: true,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[3].id, // Destrucción Total por Accidente
        aplica: false,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[4].id, // Responsabilidad Civil hacia terceros
        aplica: true,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[5].id, // Daños Parciales por Accidente
        aplica: false,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[6].id, // Daños Parciales por Granizo
        aplica: true,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[7].id, // Robo o Hurto Parcial
        aplica: false,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[8].id, // Cristales Laterales
        aplica: true,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[9].id, // Parabrisas y Luneta
        aplica: false,
      },
      {
        cobertura_id: coberturas[0].id, // Cobertura Básica
        detalle_id: detalles[10].id, // Parabrisas y Luneta2
        aplica: false,
      },
      // Cobertura Intermedia (id: 2)
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[0].id, // Responsable Civil hasta $23.000.000
        aplica: false,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[1].id, // Pérdida Total por Incendio
        aplica: true,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[2].id, // Robo o Hurto Total
        aplica: false,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[3].id, // Destrucción Total por Accidente
        aplica: true,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[4].id, // Responsabilidad Civil hacia terceros
        aplica: false,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[5].id, // Daños Parciales por Accidente
        aplica: true,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[6].id, // Daños Parciales por Granizo
        aplica: false,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[7].id, // Robo o Hurto Parcial
        aplica: true,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[8].id, // Cristales Laterales
        aplica: false,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[9].id, // Parabrisas y Luneta
        aplica: true,
      },
      {
        cobertura_id: coberturas[1].id, // Cobertura Intermedia
        detalle_id: detalles[10].id, // Parabrisas y Luneta2
        aplica: false,
      },
      // Cobertura Total (id: 3)
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[0].id, // Responsable Civil hasta $23.000.000
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[1].id, // Pérdida Total por Incendio
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[2].id, // Robo o Hurto Total
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[3].id, // Destrucción Total por Accidente
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[4].id, // Responsabilidad Civil hacia terceros
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[5].id, // Daños Parciales por Accidente
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[6].id, // Daños Parciales por Granizo
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[7].id, // Robo o Hurto Parcial
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[8].id, // Cristales Laterales
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[9].id, // Parabrisas y Luneta
        aplica: true,
      },
      {
        cobertura_id: coberturas[2].id, // Cobertura Total
        detalle_id: detalles[10].id, // Parabrisas y Luneta2
        aplica: false,
      },
    ];

    const created = await CoberturaDetalle.bulkCreate(relaciones);
    console.log(`✅ ${created.length} relaciones cobertura-detalle creadas`);
    return created;
  }

  private async seedTiposContratacion() {
    console.log("📝 Creando tipos de contratación...");

    const tipos = [
      { nombre: "Anual", cantidadMeses: 12, activo: true },
      { nombre: "Semestral", cantidadMeses: 6, activo: true },
      { nombre: "Trimestral", cantidadMeses: 3, activo: true },
      { nombre: "Mensual", cantidadMeses: 1, activo: true },
    ];

    const created = await TipoContratacion.bulkCreate(tipos);
    console.log(`✅ ${created.length} tipos de contratación creados`);
    return created;
  }

  private async seedConfiguracionesEdad() {
    console.log("👶 Creando configuraciones de edad...");

    const configuraciones: Array<any> = [];
    const rangoMax = 100;
    const bloque = 10;

    for (let inicio = 18; inicio <= rangoMax; inicio += bloque) {
      const minima = inicio;
      const maxima = Math.min(inicio + bloque - 1, rangoMax);
      configuraciones.push({
        nombre: `${minima}-${maxima} años`,
        minima: minima,
        maxima: maxima,
        descuento: Math.round(Math.random() * 5), // ejemplo random 0-5%
        ganancia: Math.round(Math.random() * 6 + 2), // 2-8%
        recargo: Math.round(Math.random() * 10 + 1), // 1-11%
        activo: true,
      });
    }

    const created = await ConfigEdad.bulkCreate(configuraciones);
    console.log(`✅ ${created.length} configuraciones de edad creadas`);
    return created;
  }

  private async seedConfiguracionesLocalidad() {
    console.log("🏙️ Creando configuraciones de localidad...");

    const localidades = await Localidad.findAll();
    console.log(`Found ${localidades.length} localidades for reference`);

    const configuraciones = localidades.map((loc) => ({
      nombre: loc.descripcion,
      descuento: Math.round(Math.random() * 5 + 0), // ejemplo: descuento random entre 0-5%
      ganancia: Math.round(Math.random() * 15 + 5), // ganancia random entre 5-20%
      recargo: Math.round(Math.random() * 5 + 1), // recargo random entre 1-6%
      activo: true,
      localidad_id: loc.id,
    }));

    const created = await ConfigLocalidad.bulkCreate(configuraciones);
    console.log(`✅ ${created.length} configuraciones de localidad creadas`);
    return created;
  }

  private async seedConfiguracionesAntiguedad() {
    console.log("📅 Creando configuraciones de antigüedad...");

    const configuraciones: Array<any> = [];
    const rangoMax = 100;
    const bloque = 10;

    for (let inicio = 0; inicio <= rangoMax; inicio += bloque) {
      const minima = inicio;
      const maxima = Math.min(inicio + bloque - 1, rangoMax);
      configuraciones.push({
        nombre: `${minima}-${maxima} años`,
        minima: minima,
        maxima: maxima,
        descuento: Math.round(Math.random() * 5), // ejemplo 0-5%
        ganancia: Math.round(Math.random() * 10 + 5), // 5-15%
        recargo: Math.round(Math.random() * 20 + 10), // 10-30%
        activo: true,
      });
    }

    const created = await ConfigAntiguedad.bulkCreate(configuraciones);
    console.log(`✅ ${created.length} configuraciones de antigüedad creadas`);
    return created;
  }

  private async seedPeriodosPago() {
    console.log("💳 Creando períodos de pago...");

    const periodos = [
      { nombre: "Contado", cantidadMeses: 1, descuento: 0.05, activo: true },
      { nombre: "3 Cuotas", cantidadMeses: 3, descuento: 0.0, activo: true },
      { nombre: "6 Cuotas", cantidadMeses: 6, descuento: 0.0, activo: true },
      { nombre: "12 Cuotas", cantidadMeses: 12, descuento: 0.0, activo: true },
    ];

    const created = await PeriodoPago.bulkCreate(periodos);
    console.log(`✅ ${created.length} períodos de pago creados`);
    return created;
  }

  private async seedDocumentacion() {
    console.log("📄 Creando documentación...");

    // Crear documentación ficticia con buffers vacíos
    const documentos = [];

    // Create 60 documentation records
    for (let i = 1; i <= 60; i++) {
      documentos.push({
        fotoFrontal: Buffer.from(`fake-photo-frontal-${i}`),
        fotoTrasera: Buffer.from(`fake-photo-trasera-${i}`),
        fotoLateral1: Buffer.from(`fake-photo-lateral1-${i}`),
        fotoLateral2: Buffer.from(`fake-photo-lateral2-${i}`),
        fotoTecho: Buffer.from(`fake-photo-techo-${i}`),
        cedulaVerde: Buffer.from(`fake-cedula-verde-${i}`),
      });
    }

    const created = await Documentacion.bulkCreate(documentos);
    console.log(`✅ ${created.length} documentos creados`);
    return created;
  }

  private async seedCotizaciones() {
    console.log("💰 Creando cotizaciones...");

    // Helper function to generate random date within a specific month (0 = current month, 1 = last month, etc.)
    const getRandomDateInMonth = (monthsAgo: number) => {
      const now = new Date();
      // Set to first day of current month first to avoid issues
      const date = new Date(now.getFullYear(), now.getMonth(), 1);
      // Then go back the specified number of months
      date.setMonth(date.getMonth() - monthsAgo);

      // Get days in that target month
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Set random day in that month
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      date.setDate(randomDay);

      return date;
    };

    // Obtener vehículos para las cotizaciones
    const vehiculos = await Vehiculo.findAll();
    console.log(`Found ${vehiculos.length} vehiculos for reference`);

    const cotizaciones = [];

    // Create 15-20 quotations per month for the last 6 months (month 0 = current, 5 = 5 months ago)
    const quotationsPerMonth = 18;
    for (let month = 0; month < 6; month++) {
      for (let i = 0; i < quotationsPerMonth; i++) {
        const fechaCreacion = getRandomDateInMonth(month);
        const fechaVencimiento = new Date(fechaCreacion);
        fechaVencimiento.setDate(fechaCreacion.getDate() + 30);

        cotizaciones.push({
          fechaCreacion: fechaCreacion,
          fechaVencimiento: fechaVencimiento,
          vehiculo_id: vehiculos[Math.floor(Math.random() * vehiculos.length)].id,
          configuracionLocalidad_id: undefined,
          configuracionEdad_id: undefined,
          configuracionAntiguedad_id: undefined,
          activo: true,
        });
      }
    }

    const created = await Cotizacion.bulkCreate(cotizaciones);
    console.log(`✅ ${created.length} cotizaciones creadas`);

    // Log date range for verification
    const dates = created.map((c: any) => new Date(c.fechaCreacion));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    console.log(`   📅 Rango: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`);

    return created;
  }

  private async seedLineaCotizaciones() {
    console.log("📋 Creando líneas de cotización...");

    // Obtener cotizaciones y coberturas
    const cotizaciones = await Cotizacion.findAll();
    const coberturas = await Cobertura.findAll();
    console.log(
      `Found ${cotizaciones.length} cotizaciones and ${coberturas.length} coberturas for reference`
    );

    // Debug: Verificar que tenemos suficientes datos
    if (cotizaciones.length < 5) {
      console.log(
        `⚠️  Solo se encontraron ${cotizaciones.length} cotizaciones`
      );
    }
    if (coberturas.length < 3) {
      console.log(
        `⚠️  Solo se encontraron ${coberturas.length} coberturas, se esperaban 3`
      );
    }

    // Crear líneas de cotización para cada cotización
    const lineas = [];

    for (let i = 0; i < cotizaciones.length; i++) {
      // Distribuir las coberturas de manera variada
      const coberturaIndex = i % coberturas.length;
      const montoBase = 15000 + (coberturaIndex * 5000);
      const variacion = Math.floor(Math.random() * 5000);

      lineas.push({
        monto: montoBase + variacion,
        cotizacion_id: cotizaciones[i].id,
        cobertura_id: coberturas[coberturaIndex].id,
      });
    }

    const created = await LineaCotizacion.bulkCreate(lineas);
    console.log(`✅ ${created.length} líneas de cotización creadas`);
    return created;
  }

  private async seedPolizas() {
    console.log("📜 Creando pólizas...");

    // Helper function for random dates - improved version
    const getRandomDateLastSixMonths = (monthsAgo: number) => {
      const now = new Date();
      // Set to first day of current month first to avoid issues
      const date = new Date(now.getFullYear(), now.getMonth(), 1);
      // Then go back the specified number of months
      date.setMonth(date.getMonth() - monthsAgo);

      // Get days in that target month
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Set random day in that month
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      date.setDate(randomDay);

      return date;
    };

    const addMonths = (date: Date, months: number) => {
      const result = new Date(date);
      result.setMonth(result.getMonth() + months);
      return result;
    };

    // Obtener las referencias necesarias
    const usuarios = await Usuario.findAll();
    const documentos = await Documentacion.findAll();
    const lineasCotizacion = await LineaCotizacion.findAll();
    const periodosPago = await PeriodoPago.findAll();
    const tiposContratacion = await TipoContratacion.findAll();

    console.log(
      `Found ${usuarios.length} usuarios, ${documentos.length} documentos, ${lineasCotizacion.length} líneas cotización`
    );

    const polizas = [];
    // More VIGENTE policies for better data: 60% vigente, 15% vencida, 10% cancelada, 15% impaga
    const estadosPoliza = ["VIGENTE", "VIGENTE", "VIGENTE", "VIGENTE", "VENCIDA", "CANCELADA", "IMPAGA"];

    // Crear pólizas para la mayoría de las líneas de cotización
    for (let i = 0; i < Math.min(lineasCotizacion.length, documentos.length); i++) {
      const estado = estadosPoliza[i % estadosPoliza.length];
      const monthsAgo = Math.floor(i / 7); // Distribuir uniformemente
      const fechaContratacion = getRandomDateLastSixMonths(monthsAgo);
      const tipoContratacion = tiposContratacion[i % tiposContratacion.length];
      const mesesContrato = tipoContratacion.cantidadMeses;
      const fechaVencimiento = addMonths(fechaContratacion, mesesContrato);

      let fechaCancelacion = undefined;
      let hashContrato = undefined;

      // ALL VIGENTE policies must have blockchain hash
      if (estado === "VIGENTE") {
        hashContrato = `0x${Math.random().toString(16).substr(2, 64)}`;
      }

      // Set cancellation date if state is CANCELADA
      if (estado === "CANCELADA") {
        const cancelDaysAfter = Math.floor(Math.random() * 30) + 10;
        fechaCancelacion = new Date(fechaContratacion);
        fechaCancelacion.setDate(fechaCancelacion.getDate() + cancelDaysAfter);
      }

      polizas.push({
        usuario_legajo: usuarios[i % usuarios.length].legajo,
        documentacion_id: documentos[i].id,
        lineaCotizacion_id: lineasCotizacion[i].id,
        periodoPago_id: periodosPago[i % periodosPago.length].id,
        tipoContratacion_id: tipoContratacion.id,
        precioPolizaActual: 18000 + Math.floor(Math.random() * 7000), // 18000-25000 for consistent revenues
        montoAsegurado: 2500000 + (i * 300000),
        fechaContratacion: fechaContratacion,
        horaContratacion: `${Math.floor(Math.random() * 12) + 9}:${Math.floor(Math.random() * 60)}:00`,
        fechaVencimiento: fechaVencimiento,
        fechaCancelacion: fechaCancelacion,
        renovacionAutomatica: i % 2 === 0,
        estadoPoliza: estado as any,
        hashContrato: hashContrato,
      });
    }

    const created = await Poliza.bulkCreate(polizas);
    console.log(`✅ ${created.length} pólizas creadas`);

    // Log statistics for verification
    const vigentes = created.filter((p: any) => p.estadoPoliza === "VIGENTE");
    const conHash = created.filter((p: any) => p.hashContrato);
    console.log(`   📊 ${vigentes.length} VIGENTE, ${conHash.length} con blockchain hash`);

    return created;
  }

  private async seedPagos() {
    console.log("💵 Creando pagos de prueba...");

    // Obtener las pólizas que acabamos de crear
    const polizas = await Poliza.findAll();
    console.log(`Found ${polizas.length} polizas for reference`);

    const pagos = [];
    const paymentMethods = ["visa", "mastercard", "account_money", "debit_card"];
    const paymentTypes = ["credit_card", "debit_card", "account_money"];

    // Crear pagos para pólizas vigentes y algunas vencidas
    for (let i = 0; i < polizas.length; i++) {
      const poliza = polizas[i];

      // Only create payments for VIGENTE and some VENCIDA policies
      if (poliza.estadoPoliza === "VIGENTE" || (poliza.estadoPoliza === "VENCIDA" && i % 2 === 0)) {
        const metodoPago = paymentMethods[i % paymentMethods.length];
        const tipoPago = paymentTypes[i % paymentTypes.length];
        const montoTotal = poliza.precioPolizaActual || 15000;

        // Create payment on or shortly after contract date
        const fechaPago = new Date(poliza.fechaContratacion!);
        fechaPago.setDate(fechaPago.getDate() + Math.floor(Math.random() * 3));

        pagos.push({
          total: montoTotal,
          fecha: fechaPago,
          hora: `${Math.floor(Math.random() * 12) + 9}:${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)}`,
          poliza_numero: poliza.numero_poliza,
          mp_payment_id: `MP${1000000 + i}`,
          mp_status: "approved",
          mp_status_detail: "accredited",
          mp_external_reference: `poliza_${poliza.numero_poliza}_${fechaPago.getFullYear()}${String(fechaPago.getMonth() + 1).padStart(2, '0')}${String(fechaPago.getDate()).padStart(2, '0')}`,
          mp_payment_method_id: metodoPago,
          mp_payment_type_id: tipoPago,
          mp_preference_id: `PREF${100000 + i}`,
        });
      }

      // Create pending payment for some IMPAGA policies
      if (poliza.estadoPoliza === "IMPAGA") {
        const fechaPago = new Date(poliza.fechaContratacion!);

        pagos.push({
          total: poliza.precioPolizaActual || 15000,
          fecha: fechaPago,
          hora: `${Math.floor(Math.random() * 12) + 9}:${Math.floor(Math.random() * 60)}:00`,
          poliza_numero: poliza.numero_poliza,
          mp_status: "pending",
          mp_external_reference: `poliza_${poliza.numero_poliza}_pending`,
          mp_preference_id: `PREF${200000 + i}`,
        });
      }
    }

    const created = await Pago.bulkCreate(pagos);
    console.log(`✅ ${created.length} pagos creados`);
    return created;
  }

  private async seedSiniestros() {
    console.log("🚨 Creando siniestros de prueba...");

    // Obtener pólizas vigentes y vencidas
    const polizas = await Poliza.findAll({
      where: {
        estadoPoliza: ["VIGENTE", "VENCIDA", "CANCELADA"],
      },
    });
    const usuarios = await Usuario.findAll();

    console.log(`Found ${polizas.length} polizas for siniestros`);

    const siniestros = [];
    const estadosSiniestro = ["APROBADA", "RECHAZADA", "PENDIENTE", "APROBADA", "APROBADA"];

    // Helper to get date within policy period
    const getSiniestroDate = (poliza: any, monthsAgo: number) => {
      const fechaContratacion = new Date(poliza.fechaContratacion);
      const fechaVencimiento = poliza.fechaVencimiento ? new Date(poliza.fechaVencimiento) : new Date();

      // Get a date between contract and expiry, biased towards recent
      const now = new Date();
      const targetDate = new Date(now);
      targetDate.setMonth(now.getMonth() - monthsAgo);

      // Make sure it's within policy period
      if (targetDate < fechaContratacion) {
        targetDate.setTime(fechaContratacion.getTime() + Math.random() * (now.getTime() - fechaContratacion.getTime()));
      }
      if (targetDate > fechaVencimiento && poliza.estadoPoliza !== "VIGENTE") {
        targetDate.setTime(fechaContratacion.getTime() + Math.random() * (fechaVencimiento.getTime() - fechaContratacion.getTime()));
      }

      return targetDate;
    };

    // Create siniestros for about 85% of policies, distributed across last 6 months  
    const numSiniestros = Math.floor(polizas.length * 0.85);
    for (let i = 0; i < numSiniestros; i++) {
      const poliza = polizas[i % polizas.length];
      const estado = estadosSiniestro[i % estadosSiniestro.length];
      const monthsAgo = Math.floor(Math.random() * 6);
      const fechaSiniestro = getSiniestroDate(poliza, monthsAgo);

      siniestros.push({
        fechaSiniestro: fechaSiniestro,
        horaSiniestro: `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}:00`,
        usuario_legajo: i % 3 === 0 ? usuarios[i % usuarios.length].legajo : undefined,
        poliza_numero: poliza.numero_poliza,
        estado: estado as any,
        fotoDenuncia: Buffer.from(`fake-foto-denuncia-${i}`),
        fotoVehiculo: Buffer.from(`fake-foto-vehiculo-${i}`),
      });
    }

    const created = await Siniestro.bulkCreate(siniestros);
    console.log(`✅ ${created.length} siniestros creados (${Math.round((created.length / polizas.length) * 100)}% de pólizas)`);
    return created;
  }

  public async seedAll() {
    try {
      console.log("🌱 Iniciando proceso de seeders (versión simplificada)...");
      console.log("========================================================");

      // Conectar a la base de datos
      await sequelize.authenticate();
      console.log("✅ Conexión a la base de datos establecida");

      // Limpiar base de datos
      await this.clearTables();

      // Seed en orden de dependencias
      const provincias = await this.seedProvincias();
      const localidades = await this.seedLocalidades();
      const marcas = await this.seedMarcas();
      const modelos = await this.seedModelos();
      const versiones = await this.seedVersiones();
      const personas = await this.seedPersonas();
      const usuarios = await this.seedUsuarios();
      const clientes = await this.seedClientes();
      const vehiculos = await this.seedVehiculos();
      const coberturas = await this.seedCoberturas();
      const detalles = await this.seedDetalles();
      const coberturaDetalles = await this.seedCoberturaDetalles();
      const tiposContratacion = await this.seedTiposContratacion();
      const configuracionesEdad = await this.seedConfiguracionesEdad();
      const configuracionesLocalidad =
        await this.seedConfiguracionesLocalidad();
      const configuracionesAntiguedad =
        await this.seedConfiguracionesAntiguedad();
      const periodosPago = await this.seedPeriodosPago();

      // Crear dependencias para pólizas
      const documentacion = await this.seedDocumentacion();
      const cotizaciones = await this.seedCotizaciones();
      const lineasCotizacion = await this.seedLineaCotizaciones();
      const polizas = await this.seedPolizas();
      const pagos = await this.seedPagos();
      const siniestros = await this.seedSiniestros();

      console.log("========================================================");
      console.log("🎉 ¡Seeders completados exitosamente!");
      console.log("========================================================");

      console.log("\n📊 RESUMEN DE DATOS CREADOS:");
      console.log(`📍 Provincias: ${provincias.length}`);
      console.log(`🏘️  Localidades: ${localidades.length}`);
      console.log(`🚗 Marcas: ${marcas.length}`);
      console.log(`🚙 Modelos: ${modelos.length}`);
      console.log(`🔧 Versiones: ${versiones.length}`);
      console.log(`👥 Personas: ${personas.length}`);
      console.log(`👤 Usuarios: ${usuarios.length}`);
      console.log(`👨‍💼 Clientes: ${clientes.length}`);
      console.log(`🚗 Vehículos: ${vehiculos.length}`);
      console.log(`🛡️  Coberturas: ${coberturas.length}`);
      console.log(`📋 Detalles: ${detalles.length}`);
      console.log(`🔗 Relaciones Cob-Det: ${coberturaDetalles.length}`);
      console.log(`📝 Tipos Contratación: ${tiposContratacion.length}`);
      console.log(`👶 Config. Edad: ${configuracionesEdad.length}`);
      console.log(`💳 Períodos Pago: ${periodosPago.length}`);
      console.log(`📄 Documentación: ${documentacion.length}`);
      console.log(`💰 Cotizaciones: ${cotizaciones.length}`);
      console.log(`📋 Líneas Cotización: ${lineasCotizacion.length}`);
      console.log(`📜 Pólizas: ${polizas.length}`);
      console.log(`💵 Pagos: ${pagos.length}`);
      console.log(`🚨 Siniestros: ${siniestros.length}`);

      console.log("\n🎯 DATOS LISTOS PARA PROBAR:");
      console.log("- Usuarios: LEG001, LEG002, LEG003");
      console.log("- Clientes con vehículos asignados");
      console.log("- Coberturas y detalles relacionados");
      console.log(`- ${polizas.length} Pólizas con diferentes estados (VIGENTE, VENCIDA, CANCELADA, IMPAGA)`);
      console.log("- Cotizaciones distribuidas en los últimos 6 meses");
      console.log("- Configuraciones básicas del sistema");
      console.log(`- ${pagos.length} Pagos distribuidos según pólizas`);
      console.log(`- ${siniestros.length} Siniestros con estados APROBADA, RECHAZADA y PENDIENTE`);
      console.log(
        "\n✅ LISTO: Dashboard con datos realistas para los últimos 6 meses"
      );
    } catch (error) {
      console.error("❌ Error durante el seeding:", error);
      throw error;
    } finally {
      await sequelize.close();
    }
  }
}

// Ejecutar seeders si el archivo se ejecuta directamente
if (require.main === module) {
  const seeder = new SimpleDataSeeder();
  seeder
    .seedAll()
    .then(() => {
      console.log("✅ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

export default SimpleDataSeeder;
