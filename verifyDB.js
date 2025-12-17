require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    }
);

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado\n');

        // Cotizaciones por mes
        console.log('📊 COTIZACIONES POR MES (' + new Date().getFullYear() + ' desde julio):');
        const [cotMes] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechacreacioncotizacion, '%Y-%m') as mes,
        COUNT(*) as total
      FROM cotizacion
      WHERE fechacreacioncotizacion >= '2025-07-01'
      GROUP BY mes
      ORDER BY mes
    `);
        cotMes.forEach(r => console.log(`  ${r.mes}: ${r.total}`));

        // Pólizas por mes y estado
        console.log('\n📜 PÓLIZAS POR MES:');
        const [polMes] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fec_cont_poliza, '%Y-%m') as mes,
        estadopoliza,
        COUNT(*) as total FROM poliza
      WHERE fec_cont_poliza >= '2025-07-01'
      GROUP BY mes, estadopoliza
      ORDER BY mes, estadopoliza
    `);
        polMes.forEach(r => console.log(`  ${r.mes} (${r.estadopoliza}): ${r.total}`));

        // Pagos por mes
        console.log('\n💰 PAGOS POR MES:');
        const [pagMes] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as mes,
        COUNT(*) as cantidad,
        SUM(total) as monto
      FROM pago
      WHERE fecha >= '2025-07-01'
      GROUP BY mes
      ORDER BY mes
    `);
        pagMes.forEach(r => console.log(`  ${r.mes}: ${r.cantidad} pagos, $${Math.round(r.monto).toLocaleString()}`));

        // Siniestros por mes
        console.log('\n🚨 SINIESTROS POR MES:');
        const [sinMes] = await sequelize.query(`
      SELECT 
        DATE_FORMAT(fechasiniestro, '%Y-%m') as mes,
        estadosiniestro,
        COUNT(*) as total
      FROM siniestro
      WHERE fechasiniestro >= '2025-07-01'
      GROUP BY mes, estadosiniestro
      ORDER BY mes, estadosiniestro
    `);
        if (sinMes.length > 0) {
            sinMes.forEach(r => console.log(`  ${r.mes} (${r.estadosiniestro}): ${r.total}`));
        } else {
            console.log('  (sin datos)');
        }

        console.log('\n✅ Verificación completada');
        await sequelize.close();
    } catch (err) {
        console.error('❌', err.message);
        process.exit(1);
    }
}

checkData();
