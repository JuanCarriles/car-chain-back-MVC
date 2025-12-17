import dotenv from "dotenv";
import sequelize from "./src/config/database";
import Cotizacion from "./src/models/Cotizacion";

dotenv.config();

async function checkDates() {
    try {
        await sequelize.authenticate();
        console.log("✅ Conectado a la base de datos\n");

        const cotizaciones = await Cotizacion.findAll({
            order: [['fechaCreacion', 'ASC']],
            limit: 42,
        });

        console.log(`Total cotizaciones: ${cotizaciones.length}\n`);

        // Group by month
        const byMonth: any = {};
        cotizaciones.forEach((c: any) => {
            const fecha = new Date(c.fechaCreacion);
            const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (!byMonth[mes]) byMonth[mes] = 0;
            byMonth[mes]++;
        });

        console.log("Distribución por mes:");
        Object.keys(byMonth).sort().forEach(mes => {
            console.log(`  ${mes}: ${byMonth[mes]} cotizaciones`);
        });

        if (cotizaciones.length > 0) {
            const fechas = cotizaciones.map((c: any) => new Date(c.fechaCreacion));
            const minDate = new Date(Math.min(...fechas.map(d => d.getTime())));
            const maxDate = new Date(Math.max(...fechas.map(d => d.getTime())));
            console.log(`\n📅 Rango completo:`);
            console.log(`  Desde: ${minDate.toISOString().split('T')[0]}`);
            console.log(`  Hasta: ${maxDate.toISOString().split('T')[0]}`);
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await sequelize.close();
    }
}

checkDates();
