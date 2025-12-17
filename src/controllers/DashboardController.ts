import { Request, Response } from "express";
import Usuario from "../models/Usuario";
import Cliente from "../models/Cliente";
import Marca from "../models/Marca";
import Poliza from "../models/Poliza";
import Cobertura from "../models/Cobertura";
import Siniestro from "../models/Siniestro";
import LineaCotizacion from "../models/LineaCotizacion";
import Cotizacion from "../models/Cotizacion";
import Vehiculo from "../models/Vehiculo";
import Pago from "../models/Pago";
import { BaseService } from "../services/BaseService";
// db/connection.ts
import { Sequelize, STRING, Op } from "sequelize";
import { ethers } from "ethers";
import abi from "../ABI/abi.json"; // corregí si está en otro path

class DashboardController {
  static async getCounts(req: Request, res: Response) {
    try {
      const usuariosActivos = await Usuario.count({ where: { activo: true } });
      const clientesRegistrados = await Cliente.count();
      const marcasRegistradas = await Marca.count();
      const polizasVigentes = await Poliza.count({
        where: { estadoPoliza: "VIGENTE" },
      });
      const coberturasActivas = await Cobertura.count({
        where: { activo: true },
      });

      return BaseService.created(
        res,
        {
          usuariosActivos: usuariosActivos,
          clientesRegistrados: clientesRegistrados,
          marcasRegistradas: marcasRegistradas,
          polizasVigentes: polizasVigentes,
          coberturasActivas: coberturasActivas,
        },
        "Datos Dashboar"
      );
    } catch (error) {
      return BaseService.serverError(res, error, "Error al contar datos");
    }
  }

  static async status(req: Request, res: Response) {
    const status = { BaseDatos: "", Blockchain: "", Billetera: "" };

    // 1. Chequeo Base de Datos
    try {
      const start = Date.now();

      const db = new Sequelize(
        String(process.env.DB_NAME), // nombre de la base
        String(process.env.DB_USER), // usuario
        String(process.env.DB_PASSWORD), // password
        {
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT), // 👈 el puerto que te dio Aiven (fíjate en el dashboard)
          dialect: "mysql", // 👈 especificar siempre el dialecto
          logging: false, // opcional: silencia logs
        }
      );

      try {
        await db.authenticate(); // mejor que query("SELECT 1")
        console.log("Base de datos OK");
        status.BaseDatos = "Operativo";
      } catch (error) {
        console.error("Error en la base:", error);
        status.BaseDatos = "Caído";
      }
    } catch (e) {
      status.BaseDatos = "Caído";
    }

    // 2. Chequeo Nodo Blockchain

    const QUICKNODE_AMOY_URL = process.env.QUICKNODE_AMOY_URL!;
    const PRIVATE_KEY_EMPRESA = process.env.PRIVATE_KEY!;
    const CONTRACT_ADDRESS = "0xaAe2E8b80E9eDFf62E8D1B7127249aBbed43daE0";

    const provider = new ethers.providers.JsonRpcProvider(QUICKNODE_AMOY_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY_EMPRESA, provider);
    const contrato = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

    try {
      const responseBlock = await provider.getBlockNumber();
      status.Blockchain = "Operativo";
    } catch {
      status.Blockchain = "Caído";
    }

    // 3. Chequeo Billetera Electrónica
    try {
      const responseAddres = await wallet.getBalance();
      status.Billetera = "Operativo";
    } catch {
      status.Billetera = "Caída";
    }

    return BaseService.created(res, status, "Estatus Dashboar");
  }

  static async getSiniestrosData(req: Request, res: Response) {
    try {
      // Calcular la fecha de hace 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1); // Primer día del mes hace 6 meses

      // Obtener todos los siniestros de los últimos 6 meses
      const siniestros = await Siniestro.findAll({
        where: {
          fechaSiniestro: {
            [Op.gte]: sixMonthsAgo,
          },
        },
        attributes: ["fechaSiniestro", "estado"],
      });

      // Crear un map para almacenar los datos por mes
      const monthsMap = new Map<string, { name: string; Aprobados: number; Rechazados: number; Pendientes: number }>();

      // Inicializar los últimos 6 meses (corregido para evitar problemas con días del mes)
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      for (let i = 5; i >= 0; i--) {
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), 1);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthName = monthNames[date.getMonth()];
        monthsMap.set(monthKey, {
          name: monthName,
          Aprobados: 0,
          Rechazados: 0,
          Pendientes: 0,
        });
      }

      // Procesar los siniestros y agruparlos por mes
      siniestros.forEach((siniestro) => {
        const fecha = new Date(siniestro.fechaSiniestro);
        const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

        const monthData = monthsMap.get(monthKey);
        if (monthData) {
          if (siniestro.estado === "APROBADA") {
            monthData.Aprobados++;
          } else if (siniestro.estado === "RECHAZADA") {
            monthData.Rechazados++;
          } else if (siniestro.estado === "PENDIENTE") {
            monthData.Pendientes++;
          }
        }
      });

      // Convertir el map a un array
      const siniestrosData = Array.from(monthsMap.values());

      return BaseService.created(
        res,
        siniestrosData,
        "Datos de siniestros por mes"
      );
    } catch (error) {
      return BaseService.serverError(
        res,
        error,
        "Error al obtener datos de siniestros"
      );
    }
  }

  static async getCoberturaData(req: Request, res: Response) {
    try {
      // Paleta de colores para las coberturas
      const colorPalette = [
        "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
        "#ec4899", "#06b6d4", "#14b8a6", "#f97316", "#84cc16",
        "#6366f1", "#a855f7", "#d946ef", "#0ea5e9", "#22c55e",
        "#eab308", "#f43f5e", "#a78bfa", "#fb923c", "#4ade80"
      ];

      // Obtener coberturas activas con conteo de pólizas (excluyendo ciertos estados)
      const coberturas = await Cobertura.findAll({
        where: { activo: true },
        attributes: [
          "id",
          "nombre",
          [
            Sequelize.fn("COUNT", Sequelize.col("lineasCotizacion->poliza.numeropoliza")),
            "polizaCount",
          ],
        ],
        include: [
          {
            model: LineaCotizacion,
            as: "lineasCotizacion",
            attributes: [],
            include: [
              {
                model: Poliza,
                as: "poliza",
                attributes: [],
                where: {
                  estadoPoliza: {
                    [Op.notIn]: ["PENDIENTE", "EN_REVISIÓN", "RECHAZADA"],
                  },
                },
                required: true,
              },
            ],
            required: true,
          },
        ],
        group: ["Cobertura.idcobertura", "Cobertura.nombrecobertura"],
        raw: true,
      });

      // Barajar los colores para asignarlos aleatoriamente
      const shuffledColors = [...colorPalette].sort(() => Math.random() - 0.5);

      // Mapear los resultados al formato esperado por el frontend
      const coberturaData = coberturas.map((cobertura: any, index: number) => ({
        name: cobertura.nombre,
        value: parseInt(cobertura.polizaCount) || 0,
        color: shuffledColors[index % shuffledColors.length],
      }));

      // Filtrar coberturas que no tienen pólizas
      const filteredData = coberturaData.filter((item) => item.value > 0);

      return BaseService.created(
        res,
        filteredData,
        "Datos de coberturas con pólizas emitidas"
      );
    } catch (error) {
      return BaseService.serverError(
        res,
        error,
        "Error al obtener datos de coberturas"
      );
    }
  }

  static async getRecaudacionData(req: Request, res: Response) {
    try {
      // Calcular la fecha de hace 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1); // Primer día del mes hace 6 meses

      // Obtener todos los pagos de los últimos 6 meses
      const pagos = await Pago.findAll({
        where: {
          fecha: {
            [Op.gte]: sixMonthsAgo,
          },
        },
        attributes: ["fecha", "total"],
      });

      // Crear un map para almacenar los datos por mes
      const monthsMap = new Map<string, { name: string; Monto: number }>();

      // Inicializar los últimos 6 meses (corregido para evitar problemas con días del mes)
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      for (let i = 5; i >= 0; i--) {
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), 1);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthName = monthNames[date.getMonth()];
        monthsMap.set(monthKey, {
          name: monthName,
          Monto: 0,
        });
      }

      // Procesar los pagos y agruparlos por mes
      pagos.forEach((pago) => {
        const fecha = new Date(pago.fecha);
        const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

        const monthData = monthsMap.get(monthKey);
        if (monthData) {
          monthData.Monto += Number(pago.total);
        }
      });

      // Convertir el map a un array
      const recaudacionData = Array.from(monthsMap.values());

      return BaseService.created(
        res,
        recaudacionData,
        "Datos de recaudación por mes"
      );
    } catch (error) {
      return BaseService.serverError(
        res,
        error,
        "Error al obtener datos de recaudación"
      );
    }
  }

  static async getCotizacionesData(req: Request, res: Response) {
    try {
      // Calcular la fecha de hace 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1); // Primer día del mes hace 6 meses

      // Obtener todas las cotizaciones de los últimos 6 meses
      const cotizaciones = await Cotizacion.findAll({
        where: {
          fechaCreacion: {
            [Op.gte]: sixMonthsAgo,
          },
        },
        attributes: ["id", "fechaCreacion"],
        include: [
          {
            model: LineaCotizacion,
            as: "lineas",
            attributes: ["id"],
            required: false, // LEFT JOIN para obtener todas las cotizaciones
            include: [
              {
                model: Poliza,
                as: "poliza",
                attributes: ["numero_poliza", "estadoPoliza"],
                required: false,
              },
            ],
          },
        ],
      });

      // Crear un map para almacenar los datos por mes
      const monthsMap = new Map<string, { name: string; Generadas: number; Contratadas: number }>();

      // Inicializar los últimos 6 meses (corregido para evitar problemas con días del mes)
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      for (let i = 5; i >= 0; i--) {
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), 1);
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthName = monthNames[date.getMonth()];
        monthsMap.set(monthKey, {
          name: monthName,
          Generadas: 0,
          Contratadas: 0,
        });
      }

      // Estados excluidos para considerar una cotización como "contratada"
      const estadosExcluidos = ["PENDIENTE", "EN_REVISIÓN", "RECHAZADA"];

      // Procesar las cotizaciones y agruparlas por mes
      cotizaciones.forEach((cotizacion: any) => {
        const fecha = new Date(cotizacion.fechaCreacion);
        const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

        const monthData = monthsMap.get(monthKey);
        if (monthData) {
          // Incrementar cotizaciones generadas
          monthData.Generadas++;

          // Verificar si la cotización tiene líneas asociadas a pólizas con estado válido
          const tienePolizaContratada = cotizacion.lineas?.some(
            (linea: any) =>
              linea.poliza && !estadosExcluidos.includes(linea.poliza.estadoPoliza)
          );

          if (tienePolizaContratada) {
            monthData.Contratadas++;
          }
        }
      });

      // Convertir el map a un array
      const cotizacionesData = Array.from(monthsMap.values());

      return BaseService.created(
        res,
        cotizacionesData,
        "Datos de cotizaciones generadas vs contratadas por mes"
      );
    } catch (error) {
      return BaseService.serverError(
        res,
        error,
        "Error al obtener datos de cotizaciones"
      );
    }
  }

  static async getKPIData(req: Request, res: Response) {
    try {
      // Calcular fechas para el mes actual y el mes anterior
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // 1. Pólizas vigentes
      const polizasVigentes = await Poliza.count({
        where: { estadoPoliza: "VIGENTE" },
      });

      const polizasVigentesMesAnterior = await Poliza.count({
        where: {
          estadoPoliza: "VIGENTE",
          fechaContratacion: {
            [Op.lt]: startOfCurrentMonth,
          },
        },
      });

      // 2. Pólizas vencidas
      const polizasVencidas = await Poliza.count({
        where: { estadoPoliza: "VENCIDA" },
      });

      const polizasVencidasMesAnterior = await Poliza.count({
        where: {
          estadoPoliza: "VENCIDA",
          fechaVencimiento: {
            [Op.lt]: startOfCurrentMonth,
          },
        },
      });

      // 3. Pólizas canceladas
      const polizasCanceladas = await Poliza.count({
        where: { estadoPoliza: "CANCELADA" },
      });

      const polizasCanceladasMesAnterior = await Poliza.count({
        where: {
          estadoPoliza: "CANCELADA",
          fechaCancelacion: {
            [Op.lt]: startOfCurrentMonth,
          },
        },
      });

      // 4. Siniestros del mes (solo APROBADOS y RECHAZADOS, excluyendo PENDIENTES)
      const siniestrosDelMes = await Siniestro.count({
        where: {
          fechaSiniestro: {
            [Op.gte]: startOfCurrentMonth,
          },
          estado: {
            [Op.in]: ["APROBADA", "RECHAZADA"], // Solo siniestros resueltos
          },
        },
      });

      const siniestrosMesAnterior = await Siniestro.count({
        where: {
          fechaSiniestro: {
            [Op.gte]: startOfPreviousMonth,
            [Op.lte]: endOfPreviousMonth,
          },
          estado: {
            [Op.in]: ["APROBADA", "RECHAZADA"], // Solo siniestros resueltos
          },
        },
      });

      // 5. Recaudación del mes
      const recaudacionRaw = await Pago.sum("total", {
        where: {
          fecha: {
            [Op.gte]: startOfCurrentMonth,
          },
        },
      });
      const recaudacionDelMes = recaudacionRaw || 0;

      const recaudacionMesAnteriorRaw = await Pago.sum("total", {
        where: {
          fecha: {
            [Op.gte]: startOfPreviousMonth,
            [Op.lte]: endOfPreviousMonth,
          },
        },
      });
      const recaudacionMesAnterior = recaudacionMesAnteriorRaw || 0;

      // 6. Nuevos clientes del mes
      // Como Cliente no tiene timestamps, contaremos clientes con pólizas contratadas este mes
      const clientesDelMesData = await Cliente.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("Cliente.idcliente")), "id"]],
        include: [
          {
            model: Vehiculo,
            as: "vehiculos",
            required: true,
            attributes: [],
            include: [
              {
                model: Cotizacion,
                as: "cotizaciones",
                required: true,
                attributes: [],
                include: [
                  {
                    model: LineaCotizacion,
                    as: "lineas",
                    required: true,
                    attributes: [],
                    include: [
                      {
                        model: Poliza,
                        as: "poliza",
                        required: true,
                        attributes: [],
                        where: {
                          fechaContratacion: {
                            [Op.gte]: startOfCurrentMonth,
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        raw: true,
      });
      const nuevosClientesDelMes = clientesDelMesData.length;

      const clientesMesAnteriorData = await Cliente.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("Cliente.idcliente")), "id"]],
        include: [
          {
            model: Vehiculo,
            as: "vehiculos",
            required: true,
            attributes: [],
            include: [
              {
                model: Cotizacion,
                as: "cotizaciones",
                required: true,
                attributes: [],
                include: [
                  {
                    model: LineaCotizacion,
                    as: "lineas",
                    required: true,
                    attributes: [],
                    include: [
                      {
                        model: Poliza,
                        as: "poliza",
                        required: true,
                        attributes: [],
                        where: {
                          fechaContratacion: {
                            [Op.gte]: startOfPreviousMonth,
                            [Op.lte]: endOfPreviousMonth,
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        raw: true,
      });
      const nuevosClientesMesAnterior = clientesMesAnteriorData.length;

      // 7. Pólizas en blockchain
      const polizasEnBlockchain = await Poliza.count({
        where: Sequelize.where(
          Sequelize.col("hash_contrato"),
          Op.ne,
          null
        ) as any,
      });


      const polizasEnBlockchainMesAnterior = await Poliza.count({
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.col("hash_contrato"),
              Op.ne,
              null
            ) as any,
            {
              fechaContratacion: {
                [Op.lt]: startOfCurrentMonth,
              },
            },
          ],
        },
      });

      // Función auxiliar para calcular tendencia
      const calcularTendencia = (actual: number, anterior: number) => {
        const diferencia = actual - anterior;
        if (anterior === 0) {
          return diferencia > 0 ? `+${diferencia}` : diferencia === 0 ? "Sin cambios" : `${diferencia}`;
        }
        const porcentaje = ((diferencia / anterior) * 100).toFixed(0);
        return diferencia > 0 ? `+${porcentaje}%` : `${porcentaje}%`;
      };

      // Función auxiliar para determinar el status
      const calcularStatus = (actual: number, anterior: number, inverso: boolean = false) => {
        const diferencia = actual - anterior;
        if (diferencia === 0) return "neutral";
        if (inverso) {
          return diferencia < 0 ? "up" : "danger";
        }
        return diferencia > 0 ? "up" : "down";
      };

      // Formatear recaudación
      const formatearMoneda = (valor: number) => {
        return `$${valor.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      };

      // Construir respuesta
      const kpiData = [
        {
          title: "Pólizas vigentes",
          value: polizasVigentes.toString(),
          trend: calcularTendencia(polizasVigentes, polizasVigentesMesAnterior),
          status: calcularStatus(polizasVigentes, polizasVigentesMesAnterior),
          icon: "shield",
          color: "#2563eb",
          bg: "#eff6ff",
        },
        {
          title: "Pólizas vencidas",
          value: polizasVencidas.toString(),
          trend: calcularTendencia(polizasVencidas, polizasVencidasMesAnterior),
          status: calcularStatus(polizasVencidas, polizasVencidasMesAnterior, true),
          icon: "alert-circle",
          color: "#ea580c",
          bg: "#fff7ed",
        },
        {
          title: "Pólizas canceladas",
          value: polizasCanceladas.toString(),
          trend: calcularTendencia(polizasCanceladas, polizasCanceladasMesAnterior),
          status: "neutral",
          icon: "x-circle",
          color: "#dc2626",
          bg: "#fef2f2",
        },
        {
          title: "Siniestros del mes",
          value: siniestrosDelMes.toString(),
          trend: calcularTendencia(siniestrosDelMes, siniestrosMesAnterior),
          status: calcularStatus(siniestrosDelMes, siniestrosMesAnterior, true),
          icon: "zap",
          color: "#9333ea",
          bg: "#faf5ff",
        },
        {
          title: "Recaudación del mes",
          value: formatearMoneda(recaudacionDelMes),
          trend: calcularTendencia(recaudacionDelMes, recaudacionMesAnterior),
          status: calcularStatus(recaudacionDelMes, recaudacionMesAnterior),
          icon: "dollar-sign",
          color: "#16a34a",
          bg: "#f0fdf4",
        },
        {
          title: "Nuevos clientes del mes",
          value: nuevosClientesDelMes.toString(),
          trend: calcularTendencia(nuevosClientesDelMes, nuevosClientesMesAnterior),
          status: calcularStatus(nuevosClientesDelMes, nuevosClientesMesAnterior),
          icon: "users",
          color: "#3b82f6",
          bg: "#eff6ff",
        },
        {
          title: "Pólizas en blockchain",
          value: polizasEnBlockchain.toString(),
          trend: calcularTendencia(polizasEnBlockchain, polizasEnBlockchainMesAnterior),
          status: calcularStatus(polizasEnBlockchain, polizasEnBlockchainMesAnterior),
          icon: "link",
          color: "#4f46e5",
          bg: "#eef2ff",
        },
      ];

      return BaseService.created(
        res,
        kpiData,
        "Datos de KPIs del dashboard"
      );
    } catch (error) {
      return BaseService.serverError(
        res,
        error,
        "Error al obtener KPIs del dashboard"
      );
    }
  }
}

export default DashboardController;
