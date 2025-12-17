import dotenv from "dotenv";
import sequelize from "./src/config/database";
import Cotizacion from "./src/models/Cotizacion";
import LineaCotizacion from "./src/models/LineaCotizacion";
import Poliza from "./src/models/Poliza";

dotenv.config();

async function verifyRelations() {
    try {
        await sequelize.authenticate();
        console.log("✅ Conectado a la base de datos\n");

        const cotizaciones = await Cotizacion.count();
        const lineas = await LineaCotizacion.count();
        const polizas = await Poliza.count();

        console.log("📊 TOTALES:");
        console.log(`  Cotizaciones: ${cotizaciones}`);
        console.log(`  Líneas Cotización: ${lineas}`);
        console.log(`  Pólizas: ${polizas}\n`);

        // Verificar cotizaciones sin líneas
        const cotizacionesSinLineas = await sequelize.query(`
      SELECT COUNT(*) as total FROM cotizacion c
      LEFT JOIN lineacotizacion lc ON c.idcotizacion = lc.cotizacion_id
      WHERE lc.idlineacotizacion IS NULL
    `, { type: sequelize.QueryTypes.SELECT });

        console.log(`⚠️  Cotizaciones sin líneas: ${(cotizacionesSinLineas[0] as any).total}`);

        // Verificar líneas sin pólizas
        const lineasSinPolizas = await sequelize.query(`
      SELECT COUNT(*) as total FROM lineacotizacion lc
      LEFT JOIN poliza p ON lc.idlineacotizacion = p.lineacotizacion_id
      WHERE p.numeropoliza IS NULL
    `, { type: sequelize.QueryTypes.SELECT });

        console.log(`⚠️  Líneas sin pólizas: ${(lineasSinPolizas[0] as any).total}\n`);

        // Verificar estados de pólizas
        const estadosPolizas = await sequelize.query(`
      SELECT estadopoliza, COUNT(*) as total 
      FROM poliza 
      GROUP BY estadopoliza
      ORDER BY total DESC
    `, { type: sequelize.QueryTypes.SELECT });

        console.log("📋 Estados de pólizas:");
        estadosPolizas.forEach((e: any) => {
            console.log(`  ${e.estadopoliza}: ${e.total}`);
        });

        // Verificar distribución por mes de pólizas
        const polizasPorMes = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fec_cont_poliza, '%Y-%m') as mes,
        COUNT(*) as total
      FROM poliza
      GROUP BY DATE_FORMAT(fec_cont_poliza, '%Y-%m')
      ORDER BY mes
    `, { type: sequelize.QueryTypes.SELECT });

        console.log("\n📅 Pólizas por mes:");
        polizasPorMes.forEach((p: any) => {
            console.log(`  ${p.mes}: ${p.total} pólizas`);
        });

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await sequelize.close();
    }
}

verifyRelations();
